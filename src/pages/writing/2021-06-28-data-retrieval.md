---
layout: "@layouts/WritingLayout.astro"
---

# Downloading daily stock data

My ambition is to build a fully automated trading system that:
- Downloads the latest data
- Performs some cleaning steps
- Generates trading signals
- Opens and closes positions in accordance with a risk management framework

This system will be built step by step in a series of posts. As the list suggests, the first step is to update the database with the latest data when it is available. First, what database are we using?
## Database
There are many options when it comes to chosing a database. The most popular type of database for tabular data is a SQL database. This is due to their good performance and data structure. SQL databases are structured in a tabular fasion which is the same structure that pandas dataframes are structured. Noteworthy SQL databases are MariaDB, PostgreSQL and SQLite. However, a SQL database will not be used in this project for a number of reasons. Instead, a NOSQL database will be used. More specifically, [MongoDB](https://en.wikipedia.org/wiki/MongoDB). But, why? First let's address the pros and cons of SQL databases. It is true that they usually have good performance. This can be a deciding factor, but for small amounts of data (<50GB) there might not be any difference. NOSQL databases can be just as performant if queried correctly and if indicies are used. When it comes to the data structure, some restructuring of the data has to be performed before it can be inserted into a NOSQL database. But this is not a problem, many python libraries have functions such as `dataframe.to_dict("records")` that easily converts tabular data into a list of dictionaries suited for NOSQL databases. These arguments cancel eachother out, and either database type could be used. The final con of SQL databases that tips the needle in favor of NOSQL databases is that the python libraries that are used to access SQL databases have terrible APIs. Not only that, setting up such a database is also a painful process that takes a lot of time if it is to be done right.
## Imports and connections
Now for the program used to download the data. The following imports and connections are going to be needed.


```python
import yfinance as yf
import pymongo
from tqdm import tqdm
from datetime import datetime
import pandas as pd
import borsdata_api as api

api = api.BorsdataAPI(open("api.txt", "r").read())  # Börsdata is used as data source
client = pymongo.MongoClient('192.168.1.38', 27017) # MongoDB server connection
daily = client.prod.daily                           # The collection used to store daily data
```

## Defining aggregation query and getting the symbols
It is important not to add duplicate data to the database. This can be solved by quering the database for all the dates that are already present in the database and then ignore these dates when adding the new data. This can be done with the following MongoDB aggregation query. It essencially matches the wanted stock symbol and then creates a list with all the dates.<br><br>
This cell also contains the query for all the stock symbols. These are stored in a separate collection called `stock_info`. The list of symbols returned will be used to tell the API what stocks to download.


```python
aggreg_query = [
            {
                '$match': {'symbol': None}
            }, {
                '$group': {
                    '_id': '$symbol', 
                        'index': {'$push': '$date'}
                    }
                }
            ]
symbols = [(stock["yahoo"], stock["insId"]) for stock in client.prod.stock_info.find()]
print("Number of symbols:", len(symbols))
```

    Number of symbols: 1780


## Download loop
This is where the magic happens. This for-loop loops through the list of symbols previously retrieved and performs these steps:
- Downloads the data.
- Removes rows with NaN values.
- Detaches the index (dates) and adds it as a column.
- Makes all the column names lowercase.
- Adds the symbol to every row. This is an important field for when every row becomes a document.
- Adds the date and time when the data was retrieved.
- Adds a string as the primary key. This a second security measure to prevents the adding of the same date twice to the database.
- Removes the already present rows from the data we are going to add to the database. This uses the abovementioned aggregation query.
- Finally, it converts the tabular data to documents (dictionaries) and inserts them into the database.

This loop may take a long time to finish. Especially when the number of stocks is large. Some APIs might stop giving you data by blocking your requests a long time before all the symbols have been looped through. This is one of the reasons by [Börsdata](https://borsdata.se/) is used. Although it is a payed service, it does not limit the number of requests. If this is not an option for you, YahooFinance's API can be used. The pros are that they have all the stocks you could ever want and are free, but they start blocking requests after a couple of hundred queries.


```python
progress = tqdm(symbols)
for symbol, insId in progress:
    progress.set_description(symbol) # Set progress bar description
    
    df = api.get_instrument_stock_prices(insId) # Download the data
    #df = data[symbol]
    df = df.dropna()
    df.reset_index(level=0, inplace=True)
    df.columns = [column.lower() for column in df.columns]
    df["symbol"] = symbol
    df["updated"] = datetime.now()
    df["_id"] = df["symbol"] + ":" + df["date"].astype(str)

    aggreg_query[0]["$match"]["symbol"] = symbol
    index = list(daily.aggregate(aggreg_query))
    if len(index)>0: # Check if stock already in db
        index=index[0]
        index = pd.Series(index["index"])
        df = df[~df['date'].isin(index)] # Ignoring indicies already in db
        
    if len(df)>0:
        daily.insert_many(df.to_dict('records'))
```

## Cronjob
To make the data retrieval automatic it has to be scheduled. This can easily be done using cronjob on linux machines. The following script will be made into a [cronjob](https://en.wikipedia.org/wiki/Cron) and this parameter will be added to the crontab `0 18 * * 1-5 data_downloader/daily_downloader.py`. The parameter means that the command should be run every weekday at 18 o'clock.


```python
# daily_downloader.py
#----------------------------------------------------------------------------

#!data_downloader/env/bin/python
import yfinance as yf
import pymongo
from tqdm import tqdm
from datetime import datetime
import pandas as pd
import borsdata_api as api

api = api.BorsdataAPI(open("api.txt", "r").read())  # Börsdata is used as data source
client = pymongo.MongoClient('192.168.1.38', 27017) # MongoDB server connection
daily = client.prod.daily                           # The collection used to store daily data

aggreg_query = [
            {
                '$match': {'symbol': None}
            }, {
                '$group': {
                    '_id': '$symbol', 
                        'index': {'$push': '$date'}
                    }
                }
            ]

symbols = [(stock["yahoo"], stock["insId"]) for stock in client.prod.stock_info.find()]
print("Number of symbols:", len(symbols))
progress = tqdm(symbols)
for symbol, insId in progress:
    progress.set_description(symbol) # Set progress bar description
    
    df = api.get_instrument_stock_prices(insId) # Download the data
    #df = data[symbol]
    df = df.dropna()
    df.reset_index(level=0, inplace=True)
    df.columns = [column.lower() for column in df.columns]
    df["symbol"] = symbol
    df["updated"] = datetime.now()
    df["_id"] = df["symbol"] + ":" + df["date"].astype(str)

    aggreg_query[0]["$match"]["symbol"] = symbol
    index = list(daily.aggregate(aggreg_query))
    if len(index)>0: # Check if stock already in db
        index=index[0]
        index = pd.Series(index["index"])
        df = df[~df['date'].isin(index)] # Ignoring indicies already in db
        
    if len(df)>0:
        daily.insert_many(df.to_dict('records'))
```
