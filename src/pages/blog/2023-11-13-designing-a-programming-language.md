---
layout: "@layouts/BlogLayout.astro"
---

<p align="center"><img src="https://github.com/ridulfo/nino-lang/raw/main/logo.png"/></p>

# Designing a functional programming language

For the last month, most of my spare time has gone towards implementing my very own programming language. I have chosen to call it [Nino](https://github.com/ridulfo/nino-lang). At the time of writing it is far from being finished. I wanted to write this post to document the process so far, and to share some of my thoughts on designing a programming language.

The goal is to create a small language that only has the essential features needed to be able to do pretty much anything. With more advanced features being implemented as libraries. Imagine a functional sibling of C.

## Early design decisions

Initially the idea was for the language to be compiled to [LLVM IR](https://en.wikipedia.org/wiki/LLVM#Intermediate_representation) using a compiler written in C. Writing it in C has been a great learning experience. However, I quickly realized that it would be a lot easier to write the compiler in a language that is more high level. I decided to rewrite the compiler in Rust. Not for the rust hype, but more as a reaction to having had to managing life-times myself while writing C. Being a higher level language it turns out that the same features could be written in less than half the number of lines. During the rewrite I also decided on first implementing an interpreter, and then later on implementing a compiler. This was recommended by people on the internet as it allows for faster iteration while the language is still in its early stages.

The hardest part has been defining the scope of the project. It feel more like the scope has progressively been discovered during the implementation. It is probably impossible to sit down and design a language from scratch without iterating on the design. What probably is quite important is to have a clear vision of what problem the language is going to solve. In the case of Nino, it is trying to be a tiny functional language that is easy to learn and use. [Atto](https://github.com/zesterer/atto) has been a great source of inspiration for this project.

## Syntax

It feels like there is a trade-off between a language's complexity, power and easy of implementation. In my opinion C strikes the perfect balance between the three. It is a simple language that is extremely powerful and maps quite well to assembly. For a functional language, this is a bit harder as assembly is inherently imperative.

### Switch-expressions

One design decision that I am very happy about is the syntax for what I have decided to call switch-expressions.

```rust
                    // | from here
                    // V
let factorial = (n) => n ? {
    0 => 1,
    1 => 1,
    n * factorial(n - 1)
}; // <-- to here
```

It reminds of [pattern matching](https://en.wikipedia.org/wiki/Pattern_matching), but is more basic in order to be easier to understand and implement. It is called switch-expression because it is essentially a switch case that returns a value. The last part of the expression is the default case. The one that is returned if none of the above cases match.

The same code in js would look like this:

```js
function factorial(n) {
    return (()=>{
        switch (n) {
            case 0:
                return 1;
            case 1:
                return 1;
            default:
                return n * factorial(n - 1);
        }
    })();
```

### Type system

The things that I have gone back and forth on the most is the type system. What is the minimum amount of types in order to be able to do pretty much anything? Here is another case of trade-off between simplicity, power and ease of implementation. One could probably do everything using `u8` and arrays of `u8`. However, that would be very tedious. I was initially inspired by LLVM IR's `u8`, `i32`, `f32` etc. However, later on I decided that it would be too much work to implement such an extensive type system and decided to go for a much simpler approach. These are the types that are going to be supported:

- `f64`: a general purpose number type
- `char`: a character
- `bool`: a boolean <aside>_This could have been a `char` that is either a zero for `true` or anything else for `false`. However it made the code ugly and hard to read. I drew the line here!_</aside>
- `fn`: a function
- `[type]`: an array of any of the above types
  - `[char]` or `str`: a string <aside>_It is possible to write either way_</aside>

With these types it should be possible to write a lot of programs. There are some things that are missing though. For example, hash maps, sets, enums, etc. These are things that probably could be libraries. Either in the language itself or with a [foreign function interface](https://en.wikipedia.org/wiki/Foreign_function_interface) to another language. Remember how in order to use booleans in C, [stdbool.h](https://pubs.opengroup.org/onlinepubs/009695399/basedefs/stdbool.h.html) needs to be included.

### Complete examples

Enough teasing, here are some complete examples of Nino code. **All of these are currently supported by the interpreter** (if `num` is replaced with `i32`). You will always find the most up to date runnable examples here: [examples](https://github.com/ridulfo/nino-lang/tree/main/examples).

There is no syntax highlighting support for Nino yet, so I have used rust instead for this post.

#### Is prime

As it is a functional programming language, [tail-call](https://en.wikipedia.org/wiki/Tail_call) optimization is a must. This is because instead of calling the function recursively, increasing the call-stack for every call. It converts it to a while-loop, which is much moreefficient.

Here is a tail recursive function to check if a number is prime.

```rust
let is_prime_helper:fn = (x:num, i:num):bool => true ? {
    x == i => true,
    x mod i == 0 => false,
    is_prime_helper(x, i + 1)
};

let is_prime:fn = (x:num):bool => x ? {
    1 => false,
    2 => true,
    is_prime_helper(x, 2)
};
```

#### Factorial

Here is a function to calculate the factorial of a number.

```rust
let factorial:fn = (n:num):num => n ? {
    0 => 1,
    1 => 1,
    n * factorial(n - 1)
};
```

The same function using tail recursion:

```rust
let factorial_helper:fn = (n:num, acc:num):num => n ? {
    0 => acc,
    1 => acc,
    factorial_helper(n - 1, acc * n)
};

let factorial:fn = (n:num):num => factorial_helper(n, 1);
```

#### Fibonacci

Here is a function to calculate the nth fibonacci number.

```rust
let fib:fn = (n:num):num => n ? {
    0 => 0,
    1 => 1,
    fib(n - 1) + fib(n - 2)
};
```

This is a perfect example of a function that could be [memoized](#memoization).

#### Printing

Here is an example of how to print to the console. In Nino, the `print` function takes an expression and returns the evaluated expression. This is a bit different from other languages where `print` returns `void`.

```rust
let two = print(1 + 1);
```

This prints `2` to the console and assigns `2` to the variable `two`.

```rust
let var = 5 ? {
    print(1+1) => 0,
    print(1+3) => 0,
    print(5)
}
```

This prints `2`, `4` and `5` to the console and assigns `5` to the variable `var`.

## Future work

## Array operations

Functional languages usually have a lot of built-in functions to operate on arrays. Here are some examples of functions that could be implemented. Since all functions are pure, it is possible to parallelize these operations, increasing performance significantly.

### Map

Mapping means to apply a function to every element in an array. Here is an example of how it could be implemented in Nino.

```rust
let odds: [num] = [1, 3, 5, 7, 9];

let increment:fn = (x:num):num => x + 1;

let evens: [num] = odds M> increment;

let back_to_odds: [num] = evens M> (x:num):num => x - 1;
```

It is also possible to chain multiple maps together.

```rust
let odds: [num] = [1, 3, 5, 7, 9];
let back_to_odds: [num] = odds
                          M> (x:num):num => x + 1
                          M> (x:num):num => x + 1;
```

### Filter

Filtering, as the name suggests, is used to remove unwanted elements from an array. This is done using a predicate function. A function that is applied on every element in the array. If the function returns `true` the element is kept, otherwise it is filtered out.

```rust
let numbers: [num] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

let is_even:fn = (x:num):bool => x mod 2 == 0;

let evens: [num] = numbers F> is_even;
```

### Reduce

Reduce is used to reduce an array to a single value. This is done by applying a function to every element in the array. The function takes two arguments, the accumulator and the current element. The accumulator is the value that is returned by the function. The first time the function is called, the accumulator is the first element in the array. The second time it is the result of the previous call. This is repeated until the array is exhausted.

```rust
let numbers: [num] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

let sum:fn = (acc:num, x:num):num => acc + x;

let total: num = numbers R> sum;
```

### Memoization

All functions in this language are pure, meaning that they do not have any [side effects](<https://en.wikipedia.org/wiki/Side_effect_(computer_science)>). Here is an example of a function in C that has a side-effect.

```c
int counter = 0;

int increment(int amount) {
    return counter += amount;
}
```

Every time `increment` is called the value of `counter` is incremented. This means that there is no way to map the input to the output of the function. A pure implementation of this function would be:

```rust
let increment:fn = (counter:num, amount:num):num => counter + 1;
```

Here, the same input will always have the same output. Which one to use in your program will depend on the context. Functional languages usually tend to be pure. This allows for the use of memoization. Memoization is a technique to cache the result of a function call. This is a very powerful technique that can be used to speed up programs at the expense of memory.

### Type inference

Type inference is a feature that is very common in functional programming languages. It allows the programmer to omit the type of a variable. The compiler will then infer the type based on the context. This is a very powerful feature that can make the code a lot more readable.

## Conclusion

As can be seen, there is a lot of work left to be done. It is a very fun and rewarding project to work on. I am looking forward to seeing where it goes. If you are interested in contributing, feel free to open an issue, pull request or start a discussion in the repo.
