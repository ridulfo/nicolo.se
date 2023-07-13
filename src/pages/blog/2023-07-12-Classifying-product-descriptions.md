---
layout: "@layouts/BlogLayout.astro"
---

# Classifying products according to UNSPSC using their descriptions
[UNSPSC](https://en.wikipedia.org/wiki/UNSPSC) is a taxonomy for product classification. Companies can use it to categorize their products and services for internal use, accounting, and reporting.
The UNSPSC is a four-level hierarchy with the following levels:
1. Segment
2. Family
3. Class
4. Commodity

**Hypothetical example:**
1. Segment: Food and Beverage Products and Services
2. Family: Fresh food products
3. Class: Fresh fruits
4. Commodity: Fresh apples

## The problem
Given a product description, we want to categorize it according to the UNSPSC taxonomy.
A notebook trying different approaches to categorizing product descriptions.

## Load UNSPSC codes
Our dataset consists of `segment`, `family`, `class`, `commodity`. Each of these is a table of prefixes and descriptions. Where segment only specifies the first two digits of the code, family specifies the first four, class the first six and commodity the full eight digits. 

A sample of the data:
- 43: IT and network and telecommunications - **Segment**
- 4322: Equipment or platforms for voice/data or multimedia networks, as well as accessories - **Family**
- 432225: Network security equipment - **Class**
- 43222501: Network firewalls - **Commodity**

Each UNSPSC code has a description in Swedish. For example `43222501` is the code for `Networking firewalls`.

Now let's load in the datasets!


```python
from descent import segments, families, classes, commodities
print("Length of segments: ", len(segments))
print("Length of families: ", len(families))
print("Length of classes: ", len(classes))
print("Length of commodities: ", len(commodities))
```

    Length of segments:  55
    Length of families:  388
    Length of classes:  3114
    Length of commodities:  38104


## Creating embeddings for Swedish text
The [KB](https://kb.se) has published a number of pretained tranformers that are free to download and use.
For this application, we are going to use a sentence embedding variant called `KBLab/sentence_bert_swedish`.

First, we need to load the model and tokenizer. We are going to use the `AutoTokenizer` and `AutoModel` classes from the `transformers` library.
Then we define a function `embed` that takes a list of strings and returns a list of embeddings.


```python
from transformers import AutoTokenizer, AutoModel
import torch
from scipy.spatial.distance import cosine

# Load model from HuggingFace Hub
# To load an older version, e.g. v1.0, add the argument revision="v1.0" 
tokenizer = AutoTokenizer.from_pretrained('KBLab/sentence-bert-swedish-cased')
model = AutoModel.from_pretrained('KBLab/sentence-bert-swedish-cased')

def mean_pooling(model_output, attention_mask):
    """
    Mean pooling of the token embeddings, weighted by the attention mask.
    """
    token_embeddings = model_output[0] #First element of model_output contains all token embeddings
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

def embed(texts: str):
    """
    Embeds a list of texts using the Sentence-BERT model.
    """
    # Tokenize sentences
    encoded_input = tokenizer(texts, padding=True, truncation=True, return_tensors='pt')

    # Compute token embeddings
    with torch.no_grad():
        model_output = model(**encoded_input)

    # Perform pooling. In this case, max pooling.
    embeddings = mean_pooling(model_output, encoded_input['attention_mask'])
    return embeddings


```

    /Users/nicolo/dev/neodev-llm/env/lib/python3.11/site-packages/tqdm/auto.py:21: TqdmWarning: IProgress not found. Please update jupyter and ipywidgets. See https://ipywidgets.readthedocs.io/en/stable/user_install.html
      from .autonotebook import tqdm as notebook_tqdm


### Sanity check
Let's try to embed a couple of sentences and see what we get.
The sentences translate to:
- I am walking in the woods
- I am walking in the desert
- I am swiming in the ocean
- I am bathing in a lake

We expect that walking in the woods and walking in the desert are more similar than swimming in the ocean and bathing in a lake.


```python
# Sentences we want sentence embeddings for
sentence1 = "Jag går i skogen"
sentence2 = "Jag går på stan"
sentence3 = "Jag simmar i havet"
sentence4 = "Jag badar i sjön"

sentences = [sentence1, sentence2, sentence3, sentence4]

# Compute cosine-similarities for each sentence with each other sentence
embeddings = embed(sentences)
for i in range(len(embeddings)):
    most_similar_index = 0
    most_similar_score = 0
    for j in range(len(embeddings)):
        if i == j: continue
        score = 1-cosine(embeddings[i], embeddings[j])
        if score > most_similar_score:
            most_similar_score = score
            most_similar_index = j
    print(f"\"{sentences[i]}\"\t is most similar to \t\"{sentences[most_similar_index]}\"")
    print()
```

    Asking to truncate to max_length but no maximum length is provided and the model has no predefined maximum length. Default to no truncation.


    "Jag går i skogen"	 is most similar to 	"Jag går på stan"
    
    "Jag går på stan"	 is most similar to 	"Jag går i skogen"
    
    "Jag simmar i havet"	 is most similar to 	"Jag badar i sjön"
    
    "Jag badar i sjön"	 is most similar to 	"Jag simmar i havet"
    


Let's define some helper functions.


```python
def get_first_item(d: dict):
    return list(d.items())[0]

def filter_by_prefix(prefixes, categories: dict):
    """
    Takes a prefix or a list of prefixes and a dictionary of
    prefixes->descriptions and returnes a filtered dictionary where only the
    prefixes that start with the given prefixes are kept.
    """
    if type(prefixes) == str:
        return {k: v for k, v in categories.items() if k.startswith(prefixes)}
    elif type(prefixes) == list:
        return {k: v for k, v in categories.items() if any(k.startswith(prefix) for prefix in prefixes)}

        

def most_similar(text: str, prefixes: dict, n = 1)->dict:
    """
    Takes a text and a dictionary of prefixes->descriptions and returns a
    dictionary of the n most similar prefixes and their descriptions.

    It performes the following steps:
    1. Embeds the text and the descriptions
    2. Computes the cosine similarity between the text and the descriptions
    3. Returns the n most similar prefixes and their descriptions
    """
    embeddings = embed([text] + list(prefixes.values()))
    text_embedding = embeddings[0]

    scores = {} # prefix -> score
    for i in range(1, len(embeddings)):
        prefix = list(prefixes.keys())[i-1]
        scores[prefix] = 1-cosine(text_embedding, embeddings[i])
    
    top_scores = dict(sorted(scores.items(), key=lambda item: item[1], reverse=True)[:n])
    
    # Filter the prefixes and only keep the ones from top_scores
    return {k: v for k, v in prefixes.items() if k in top_scores}
```

## Embedding Approaches

### Super naive approach
Just just go through all of them and find the most similar one.


```python
text = "Äpple Golden Delicious EU x13kg/kg"

top_results = most_similar(text, list(commodities.values()), 5)

for prefix, description in top_results.items():
    print(prefix, description)
```

The super naive approach didn't work. After 2 minutes on my MacBook Air M1, I had to interrupt the kernel. Let's try something else...

### Descent
Comparing too many descriptions at a time is too slow. Luckily, the UNSPSC codes are hierarchical. This means that we can start at the top and then only consider the descriptions that are children of the previous level.


```python
text = "Äpple Golden Delicious EU x13kg/kg"

print(text)
similar_segment = most_similar(text, segments)
segment_prefix, segment_name= get_first_item(similar_segment)
print(segment_prefix, segment_name)

filtered_families = filter_by_prefix(segment_prefix, families)
similar_family = most_similar(text, filtered_families)
families_prefix, families_name = get_first_item(similar_family)
print(families_prefix, families_name)

filtered_classes = filter_by_prefix(families_prefix, classes)
similar_class = most_similar(text, filtered_classes)
classes_prefix, classes_name = get_first_item(similar_class)
print(classes_prefix, classes_name)

filtered_commodities = filter_by_prefix(classes_prefix, commodities)
similar_commodity = most_similar(text, filtered_commodities)
commodities_prefix, commodities_name = get_first_item(similar_commodity)
print(commodities_prefix, commodities_name)


```

    Äpple Golden Delicious EU x13kg/kg
    50 Mat, dryck och tobaksprodukter
    5036 Fruktkonserver
    503615 Konserverade eller inlagda äpplen
    50361588 Konserverade eller inlagda äpplen, Twenty ounce


Not great, but it's a start. No idea why it decided that the apples are "Konserverade eller inlagda" (preserved) and not "Färsk frukt" (fresh fruit).

What if it dives too quickly into the wrong branch? Let's try to only consider the top `n` most similar descriptions.

### Checking the top results for every layer
Let's preserve the top `n` most similar descriptions for each level and then try to find the best path.


```python
print(text, end="\n\n")

N = 3

similar_segments = most_similar(text, segments, n=N)
segment_prefixes = list(similar_segments.keys())
for prefix, description in similar_segments.items():
    print(prefix, description)
print()

filtered_families = filter_by_prefix(segment_prefixes, families)
similar_families = most_similar(text, filtered_families, n=N)
for prefix, description in similar_families.items():
    print(prefix, description)
print()

filtered_classes = filter_by_prefix(list(similar_families.keys()), classes)
similar_classes = most_similar(text, filtered_classes, n=N)
for prefix, description in similar_classes.items():
    print(prefix, description)
print()

filtered_commodities = filter_by_prefix(list(similar_classes.keys()), commodities)
similar_commodities = most_similar(text, filtered_commodities, n=1)
for prefix, description in similar_commodities.items():
    print(prefix, description)
print()


```

    KALKON RÖKT SK BRICKA 1KG M/
    
    11 Mineraler och textilier samt oätbara växt- och djurdelar
    15 Bränslen och bränsletillsatser och smörjmedel och korrosionshindrande medel
    50 Mat, dryck och tobaksprodukter
    
    1118 Metalloxid
    1510 Bränslen
    5038 Fruktpuré
    
    151016 Bränslen i fast form och gelform
    151017 Bränsleoljor
    503818 Puréer av meloner
    
    15101602 Brunkol
    


This worked very well for the apples (not shown), but for the smoked turkey (Rökt kalkon) it got tricked by the word "rökt" (smoked). It thought that it was something combustable. We need some better understanding of the text.

## Language Models
Now, let's try to use generative language models to see if they can do better.

`languagemodels` is a python library that makes it easy to use language models for a variety of tasks. It's built on top of the `transformers` library. 

Lets see how it does!



```python
import languagemodels as lm
lm.set_max_ram('4gb')
```




    4.0



Let the prompt be a question and a number of options. The model's job is to pick the correct option. Here is an example prompt:

```
Which of the following is 'Äpple Golden Delicious EU x13kg/kg' most similar to? Only answer with the number within the parenthesis.
(0) option 1
(1) option 2
...
(9) option 10
```


```python
text = "Äpple Golden Delicious EU x13kg/kg"
prompt = f"Vilken av följande är '{text}' mest lik? Svara endast med siffran inom paranteserna\n"
for i, option in enumerate(list(segments.values())):
    prompt += f"({i}) {option}\n"

print(lm.do(prompt))
```

     ⁇ pple Golden Delicious EU x13kg/kg


Great... Also notice how it also took 8 seconds for just the first level? Even if that would have produced a good answer it took too long to be useful.

Let's try to use the classifier instead.

### Tournament approach
As we only can classify between two labels at a time, we need to do a lot of comparisons. Let's try to do it in a more efficient way.
This works in the same way as a football turnament. We start with `n` teams and then we have `n/2` matches. The winners of those matches then play against each other and so on until we have a winner.


```python
def chunk_list(lst, n):
    return [lst[i:i+n] for i in range(0, len(lst), n)]

def elimination(text: str, descriptions: list):
    """
    Takes a text and a list of descriptions and returns the most similar description's index through elimination
    """
    if len(descriptions) == 1:
        return descriptions[0]

    pairs = chunk_list(descriptions, 2)
    
    # Compute winner of each pair
    winners = []
    for pair in pairs:
        if len(pair) == 1:
            winners.append(pair[0])
        else:
            winners.append(lm.classify(text, pair[0], pair[1]))

    return elimination(text, winners)


text = "Äpple Golden Delicious EU x13kg/kg"
print(elimination(text, list(segments.values())))
```

This was also too slow! I do not think that this library is going to work out...

*I later realized that this model was probably only trained on English data. No wonder it performs so poorly on Swedish text.*

### Large Language Model (LLM) using Open AI's API
Let's bring in the big guns! Open AI has released a number of language models that can be used through their [API](https://openai.com/blog/openai-api).

Interestingly enough, the way we interface with the model is through a conversation between a `user` and a `assistant`.

**The API basically works like this:**
1. You give the model a system prompt - this is the context that the model will use to generate the response.
2. You give the model a user prompt - this is what the user would say to the assistant.
3. The model generates a response.

**How we are going to use it:**
1. Tell the model that it is a product classifier.
2. Give the model a prompt. The same as shown earlier.
3. We then extract the model's choice using regex and use that to determine which branch to go down in the classification tree.



```python
import openai
import re

with open("../api-key.txt") as f:
    openai.api_key = f.read().strip()

total_tokens = 0

def generate_prompt(text: str, descriptions: list):
    """
    Takes a text and a list of descriptions and returns a prompt for OpenAI's API
    """
    prompt = f"Vilken av följande är '{text}'? Svara ENDAST med numret inom paranteserna.\n"
    for i, option in enumerate(descriptions):
        prompt += f"({i}) {option}\n"
    return prompt

def guess(text, descriptions):
    messages = [
        {"role": "system", "content": "Du är en produktklassificerare. Hjälp till att klassificera produkter genom att svara på frågor."},
        {"role":"user", "content": generate_prompt(text, list(descriptions.values()))}
    ]
    completion = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.0,
            )
    
    global total_tokens
    total_tokens += int(completion["usage"]["total_tokens"])

    response = completion["choices"][0]["message"]["content"]

    # Extract the model's guess using regex
    number = int(re.search(r"\d+", response).group(0))

    description = list(descriptions.values())[int(number)]
    prefix = list(descriptions.keys())[int(number)]

    return prefix, description

text = "KALKON RÖKT SK BRICKA 1KG M/"

print(text, end="\n\n")

segment_prefix, segment_name = guess(text, segments)
print(segment_prefix, segment_name)

filtered_families = filter_by_prefix(segment_prefix, families)
families_prefix, families_name = guess(text, filtered_families)
print(families_prefix, families_name)

filtered_classes = filter_by_prefix(families_prefix, classes)
classes_prefix, classes_name = guess(text, filtered_classes)
print(classes_prefix, classes_name)

filtered_commodities = filter_by_prefix(classes_prefix, commodities)
commodities_prefix, commodities_name = guess(text, filtered_commodities)
print(commodities_prefix, commodities_name)

print("Final answer:", commodities_prefix)
print("Total tokens:", total_tokens)
```

    KALKON RÖKT SK BRICKA 1KG M/
    
    50 Mat, dryck och tobaksprodukter
    5011 Kött- och fjäderfäprodukter
    501120 Bearbetade kött- och fjäderfäprodukter
    50112012 Kalkon, förädlat utan tillsatser
    Final answer: 50112012
    Total tokens: 2639


That was fast and quite accurate. Unfortunately, that is quite expensive. 2500 tokens costs about $0.004. It might not sound like much, but if we want to classify 1000 products, that would cost $4.

### LLM + embedding approach
What if we only used the LLM to clean up the text and then used the embedding approach to find the most similar description?


```python
total_tokens = 0
def clean_text(text: str):
    """
    Takes a text and returns a human-readable version of it.
    """
    prompt = "Här kommer en fakturarad, kan du göra den lättare att förstå?\n"
    prompt += "\"" + text + "\"\n"

    messages = [{"role":"user", "content": prompt}]
    completion = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.0,
            )
    
    global total_tokens
    total_tokens += int(completion["usage"]["total_tokens"])

    # get the number from the response
    response = completion["choices"][0]["message"]["content"]
    return response

text = "KALKON RÖKT SK BRICKA 1KG M/"
print(text)
cleaned_text = clean_text(text)
print(cleaned_text)
print("Total tokens:", total_tokens)
```

    KALKON RÖKT SK BRICKA 1KG M/
    "Rökt skivad kalkon på bricka, 1 kg"
    Total tokens: 61


Much clearer!
Now maybe the embedding approach is good enough?


```python
N = 3
text = cleaned_text
similar_segments = most_similar(text, segments, n=N)
segment_prefixes = list(similar_segments.keys())
for prefix, description in similar_segments.items():
    print(prefix, description)
print()

filtered_families = filter_by_prefix(segment_prefixes, families)
similar_families = most_similar(text, filtered_families, n=N)
for prefix, description in similar_families.items():
    print(prefix, description)
print()

filtered_classes = filter_by_prefix(list(similar_families.keys()), classes)
similar_classes = most_similar(text, filtered_classes, n=N)
for prefix, description in similar_classes.items():
    print(prefix, description)
print()

filtered_commodities = filter_by_prefix(list(similar_classes.keys()), commodities)
similar_commodities = most_similar(text, filtered_commodities, n=1)
for prefix, description in similar_commodities.items():
    print(prefix, description)
print()
```

    10 Levande växter och djur samt tillbehör och materiel
    14 Pappersmaterial och pappersprodukter
    50 Mat, dryck och tobaksprodukter
    
    5011 Kött- och fjäderfäprodukter
    5017 Kryddor och konserver
    5019 Beredd och konserverad mat
    
    501115 Minimalt bearbetade kött- och fjäderfäprodukter
    501120 Bearbetade kött- och fjäderfäprodukter
    501927 Förpackade måltidskombinationer
    
    50112013 Kalkon, förädlat med tillsatser
    


I am stunned by how well this works. It is very fast and very accurate. It is also very cheap as we only used 60 tokens. Now classifying 1000 products would only cost $0.06.

## Conclusion
### Embedding approach
This approach is very fast, but not very accurate. Sometimes it would fixate on a specific word like "smoked" and start guessing combustible materials.

### Language model approach
The small language model approach was very slow and not very accurate. This was probably because it was trained on English data and not Swedish. There is a [GPT trained on Swedish data](https://www.ai.se/en/node/81535/gpt-sw3) but it is not generally available at the moment. Even if it was, it would probably be too slow to be useful.

Only using a large language model (Open AI) approach was reasonably fast and very accurate, but expensive. It would probably be too expensive to use in production.

### LLM + embedding approach
Cleaning up the text before using the embedding approach improved the accuracy a lot. It was also fast and cheap. This is probably the best approach for this application.



