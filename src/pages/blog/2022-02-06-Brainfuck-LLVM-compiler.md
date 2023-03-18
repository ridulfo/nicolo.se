---
layout: "@layouts/BlogLayout.astro"
---

# Writing a LLVM compiler using Python

Recently I have been fascinated by the world of compiled programming languages. My current day to day work mainly involves interpreted languages such as Python and TypeScript. These languages are great for productivity, but they leave a lot to be desired when it comes to performance and resource usage (see [benchmarks](https://benchmarksgame-team.pages.debian.net/benchmarksgame/index.html)). In order to learn more about compiled languages I started writing small programs in C++, go and Rust. Rust is awesome! In 13 lines of code a rust noob can managed to write a function that looks for a string (in lowercase and uppercase) inside of a SHA256 hash. The kicker, it is fully **parallel** thanks to the rayon library! This is usually not that easy to do in other system languages. The only difference between the single threaded and parallel code is `.into_par_iter()` part.
```Rust
pub fn find_hash(name: &str) -> String {
    let name_upper = &name.to_uppercase();
    let result = (0u64..u64::MAX).into_par_iter().find_any(|&i| {
        let mut hasher = Sha256::new();
        hasher.update(i.to_string().as_bytes());
        let hash = base64::encode(&hasher.finalize());
        return hash.contains(name) || hash.contains(name_upper);
    });
    let mut hasher = Sha256::new();
    hasher.update(result.unwrap().to_string().as_bytes());
    let hash = base64::encode(&hasher.finalize());
    hash
}
```
There is something that Rust has in common with that this post is about, it compiles down to [LLVM](https://en.wikipedia.org/wiki/LLVM) intermediate representation (IR). LLVM is basically a set of tools for developers to make compilers. A developer just needs to get their code into IR. After that, LLVM can optimize the IR for various metrics and then either run it in a jitted execution engine or compile it to machine code. One other nice thing about IR is that it is "portable" (we'll come to why I wrapped portable in quotes). There is no need to rewrite your compiler for every system architecture.

## Brainfuck
In order to learn LLVM I decided to implement a compiler for one of the simplest programming languages: [brainfuck](https://en.wikipedia.org/wiki/Brainfuck)(BF). It is a tape based language that only has these operators: `+` `-` `<` `>` `[` `]` `.` `,`. When a BF program starts an array of 8 bit integers is initialized with zeros, this is the tape. There is also a pointer that we'll call `tape_ptr` that points to the "current" element in the array. A program might look something like this: `+++.`. This means increment the integer at the `tape_ptr` by one three times, then write the integer at the `tape_ptr` to the standard output (in our case the console). One would think that a three would be printed, but the console interprets the integer as a char type. A char of value “3” does not display. If we wanted a three to print we would have to write `-[----->+<]>.`. This program decrements the current element (which overflows into 255). Then it enters a sort of while-loop given by `[]`. The code between the brackets is looped "while the current element is not zero". The `>` and `<` shift the position of the `tape_ptr` either to the right or left. The program therefore does the following:
- `-` decrement the current position
- `[----->+<]`
  - `-----` decrement the current element 5 times
  - `>` move one step to the right
  - `+` increment the current element
  - `<` move on step to the left (the initial position)
  - `]` is the value at the current element zero? 
    - if TRUE continue to the next operation (to the right)
    - if FALSE go back to the previous `[`
- `.` write the current value to stdout

The result is that the element in the second position is incremented once for every time the element in the first position is decremented five times. This gives `255/5=51`, where `255` is the overflown integer and `51` is the ascii character `'3'`. We will ignore the `,` instruction as it is quite useless; I have personally never used it. It is used for reading from stdin. However, if one is interested in writing programs in BF one should implement it in order to be able to use the language fully!

## Now to the compiler
In unrelated project have used a python library called [Numba](https://numba.pydata.org) a lot to speed up numerical computations. It manages to be so fast by compiling a subset of python down to IR which is then run on LLVM's jit execution engine. It can easily speed up python by [24 times](https://github.com/nicoloridulfo/Sudoku-solver-implementations) and come close to C++ speeds. Numba uses a library called [llvmlite](https://github.com/numba/llvmlite) to generate the IR. This is the library we are going to be using. 

This whole project has really been a brainfuck. The documentation has been much thinner than I am used and, in some cases, nonexistent. To learn how to make [system calls](https://en.wikipedia.org/wiki/System_call) to the operating system kernel in order to write to stdout I had to read what registers to populate with what values by looking at source code. Because we are doing this on... Darwin ARM64! Which wants to have values in other registers than the linux on ARM64, or so it seems depending on what documentation you read. At this level, the error messages stop being helpful. When trying to implement the syscalls the kernel would just say things like:

>zsh: invalid system call  ./a.out

Ok thanks, very useful!

Enough, let's start coding:



```python
from llvmlite import ir

code=""

counter = 0
def block_namer():
    global counter
    counter += 1
    return "block_%d" % (counter-1)

TAPE_LEN = 10
mod = ir.Module("MainModule")
mod.triple = "arm64-apple-macosx12.0.0"
lfunc = ir.Function(mod, ir.FunctionType(ir.IntType(8), []), "main")
entry_block = lfunc.append_basic_block('entry')
builder = ir.IRBuilder(entry_block)
exit_block = builder.append_basic_block("exit")
mod
```




    ; ModuleID = "MainModule"
    target triple = "arm64-apple-macosx12.0.0"
    target datalayout = ""
    
    define i8 @"main"() 
    {
    entry:
    exit:
    }



The compiler starts with these lines. It defines a main function where, like many languages, is where the program starts executing. More specifically, in the entry code block. We also create an exit block that we will later use to exit the program. 

EDIT: I forgot to mention that the code generated by the python block is the LLVM IR. This is the code that will later be compiled to machine code by [clang](https://clang.llvm.org).

Now let’s create our data structures.


```python
# Create tape
tape = builder.alloca(ir.ArrayType(ir.IntType(8), TAPE_LEN))
builder.store(ir.Constant(ir.ArrayType(ir.IntType(8), TAPE_LEN), [0] * TAPE_LEN), tape)
# Create tape pointer
tape_ptr = builder.gep(
    tape, [ir.Constant(ir.IntType(8), 0), ir.Constant(ir.IntType(8), 0)])
mod
```




    ; ModuleID = "MainModule"
    target triple = "arm64-apple-macosx12.0.0"
    target datalayout = ""
    
    define i8 @"main"() 
    {
    entry:
      %".2" = alloca [10 x i8]
      store [10 x i8] [i8 0, i8 0, i8 0, i8 0, i8 0, i8 0, i8 0, i8 0, i8 0, i8 0], [10 x i8]* %".2"
      %".4" = getelementptr [10 x i8], [10 x i8]* %".2", i8 0, i8 0
    exit:
    }



We start by allocating an array of 8-bit integers of the length `TAPE_LEN` on the stack. This comes out to ` %".2" = alloca [10 x i8]`. The variable that is returned `%.2` is a pointer to the array. Notice `@` and `%`, these indicate that the variable is either global or local. For example, the function `@"main"` is global, but the pointer to the array `%".2"` is local.

The next instruction initializes the array with zeroes. Notice the `[10 x i8]* %".2"`, it refers to the pointer we created earlier as it is there we are storing the zeroes. LLVM IR is strictly typed, and the types are mentioned every time a variable is used. It says that `%.2` is a pointer to an array of ten eight-bit integers.

In the following instruction we create a pointer to the first element of the array and store it in `%.4`

In order to handle the while loops in the language we use LLVM IR's blocks. They work like labels that you can conditionally or unconditionally branch to. We keep track of the branches using a python stack (just a regular list). One issue I was having when I first started writing this compiler is that I was doing too much computation in python. I was basically precomputing the whole BF program. This is usually allowed (and recommended) for performance reasons. But then, why even write a compiler? So, the branching had to be done in BF.


```python
blocks = [builder.append_basic_block(block_namer())]
builder.branch(blocks[0])
builder = ir.IRBuilder(blocks[0])
mod
```




    ; ModuleID = "MainModule"
    target triple = "arm64-apple-macosx12.0.0"
    target datalayout = ""
    
    define i8 @"main"() 
    {
    entry:
      %".2" = alloca [10 x i8]
      store [10 x i8] [i8 0, i8 0, i8 0, i8 0, i8 0, i8 0, i8 0, i8 0, i8 0, i8 0], [10 x i8]* %".2"
      %".4" = getelementptr [10 x i8], [10 x i8]* %".2", i8 0, i8 0
      br label %"block_0"
    exit:
    block_0:
    }



The following code takes a BF instructions and translates them into the corresponding IR instructions.


```python
for op in code:
    if op == "+":
        val_at_ptr = builder.load(tape_ptr)
        builder.store(builder.add(
            val_at_ptr, ir.Constant(ir.IntType(8), 1)), tape_ptr)
    elif op == "-":
        val_at_ptr = builder.load(tape_ptr)
        builder.store(builder.sub(
            val_at_ptr, ir.Constant(ir.IntType(8), 1)), tape_ptr)
    elif op == ">":
        tape_ptr = builder.gep(tape_ptr, [ir.Constant(ir.IntType(8), 1)])
    elif op == "<":
        tape_ptr = builder.gep(tape_ptr, [ir.Constant(ir.IntType(8), -1)])
    elif op == ".":
        # https://go.dev/src/syscall/zsysnum_darwin_arm64.go
        fty = ir.FunctionType(ir.IntType(32), [
            ir.IntType(32),  # x16 (=4)
            ir.IntType(32),  # x0 (=1)
            ir.IntType(8).as_pointer(),
            ir.IntType(32)
        ])

        # Uncomment this to make char=3 => "3"
        # char = builder.add(char, ir.Constant(ir.IntType(8), 48))
        builder.asm(fty, "svc 0", "=r,{x16},{x0},{x1},{x2}", (
            ir.IntType(32)(4),
            ir.IntType(32)(1),
            tape_ptr,
            ir.IntType(32)(1)
        ), True, name="print")

    elif op == "e":
        builder.asm(ir.FunctionType(ir.IntType(32),
                                    [ir.IntType(32), ir.IntType(32)]),
                    "svc 0", "=r,{x0},{x16}", [ir.IntType(32)(8), ir.IntType(32)(1)], True, name="asm_add")
    elif op == "[":
        # Create a new block
        # Make the current block branch to the new block
        blocks.append(builder.append_basic_block(block_namer()+"_open"))
        builder.branch(blocks[-1])
        builder = ir.IRBuilder(blocks[-1])
    elif op == "]":
        # Create a new block
        # Make the current block branch to the new block if the value at the current pointer is 0
        val_at_ptr = builder.load(tape_ptr)
        branch_condition = builder.icmp_signed(
            '==', val_at_ptr, ir.Constant(ir.IntType(8), 0))
        open_block = blocks.pop()
        close_block = builder.append_basic_block(
            open_block.name.replace("open", "close"))
        builder.cbranch(branch_condition, close_block, open_block)
        builder = ir.IRBuilder(close_block)
```

### Increment & Decrement
There is a lot of code to unpack here. Let’s start with the `+` and `-` instructions.
```Python
val_at_ptr = builder.load(tape_ptr)
builder.store(builder.add(
    val_at_ptr, ir.Constant(ir.IntType(8), 1)), tape_ptr)
```
The IR will look something like this:
```
%".6" = load i8, i8* %".4"
%".7" = add i8 %".6", 1
store i8 %".7", i8* %".4"
```
Remember that the pointer to the current element was `.4` It loads the value of the current element into `.6`, then add `1` to it and finally stores it where `.4` points.
### Move tape pointer
```Python
tape_ptr = builder.gep(tape_ptr, [ir.Constant(ir.IntType(8), 1)])
```
To move the tape pointer, we simply use the get element pointer function. This is similar to incrementing a pointer in regular C, but the function handles all the logistics with how many bytes to jump.
### Loops
#### For `[`:
```Python
blocks.append(builder.append_basic_block(block_namer()+"_open"))
builder.branch(blocks[-1])
builder = ir.IRBuilder(blocks[-1])
```
First, we create a new block and add it to the list of blocks. We make the current block branch to the new block unconditionally. This is because LLVM IR does not simply move to the next block after it has finished the instructions is the current block. It must explicitly be told to move to the block below (meh).

#### For `]`:
```Python
val_at_ptr = builder.load(tape_ptr)
branch_condition = builder.icmp_signed('==', val_at_ptr, ir.Constant(ir.IntType(8), 0))
open_block = blocks.pop()
close_block = builder.append_basic_block(open_block.name.replace("open", "close"))
builder.cbranch(branch_condition, close_block, open_block)
builder = ir.IRBuilder(close_block)
```
The logic is quite similar. But in this case whether we move to the next block depends on whether the value at the current pointer is zero when we are at the end of the loop.

For a program like this `+[>+[>+<-]<-]>>` the branching will look like this.
```
define i8 @"main"() 
{
entry:
    ...
    br label %"block_0"

exit:
    ...
    ret i8 %".35"
  
block_0:
    ...
    br label %"block_1_open"
    
block_1_open:
    ...
    br label %"block_2_open"
    
block_2_open:
    ...
    br i1 %".24", label %"block_2_close", label %"block_2_open" <-- This is the end of the inner loop
    
block_2_close:
    ...
    br i1 %".31", label %"block_1_close", label %"block_1_open" <-- This is the end of the outer loop
    
block_1_close:
    ..
    br label %"exit"
```


## Now to the hard part... 💀
We want to be able to print the current element's value to stdout. In order to do that the program has to talk to the kernel though a syscall. Think of it as calling on the operating system’s API that does things like write or read to stdout or files, open sockets, mount and unmount drives, change the permissions of files and much much more. The problem is that LLVM has nothing to do with the kernel. This is usually handled by local libraries. We therefore must implement this by writing native assembly. This is the part where the program becomes system architecture specific. I think that this is where we would normally be linking to local libraries that would handle this for us.

Since I am writing this on a ARM64, that is the syscall table I have to look at. As I am writing this, I wanted to add a link to the syscall table for Darwin ARM64, but I cannot find any. During the development process I scoured various forums, blogs and source code files on github to piece together how to make the correct syscall. This might be the best [table](https://thog.github.io/syscalls-table-aarch64/latest.html) I have found. However, it does not fully work on my machine. Depending on who you ask, Darwin ARM64 either uses register X16 or X8 to specify what syscall to make and uses either the value `0x40` or `4` or `0x2000004` to specify that we want to write. I have no idea, I must have tried all combinations of registers and values.

### Making the syscall
``` Python
fty = ir.FunctionType(ir.IntType(32), [
    ir.IntType(32),  # x16 (=4)
    ir.IntType(32),  # x0 (=1)
    ir.IntType(8).as_pointer(), # x1
    ir.IntType(32)   # x2
])
builder.asm(fty, "svc 0", "=r,{x16},{x0},{x1},{x2}", (
    ir.IntType(32)(4),
    ir.IntType(32)(1),
    tape_ptr,
    ir.IntType(32)(1)
), True, name="print")
```
First, we create a function type, it is basically a call signature. The assembly will return a 32-bit integer and take the following inputs. The "inputs" are values that we are going to put in the registers `{x16},{x0},{x1},{x2}`.
1. 32-bit integer - The type of syscall (write call)
1. 32-bit integer - Where to write (stdout)
1. 8-bit integer - Pointer to the char array (in our case only the current element)
1. 32-bit integer - The length of the char array


Luckily, the llvmlite library has a convenient way to write out values to the registers automatically without us having to move every value into the registers. We just specify the "constraint" ` "=r,{x16},{x0},{x1},{x2}"` and then pass the values in the args parameter 
```Python
ir.IntType(32)(4),
ir.IntType(32)(1),
tape_ptr,
ir.IntType(32)(1)
```

The actual assembly is the `svc 0` instruction.

I also implemented an exit instruction to BF that can be used by writing `e`. It makes an exit syscall.
``` Python
builder.asm(ir.FunctionType(ir.IntType(32),
    [ir.IntType(32), ir.IntType(32)]),
    "svc 0", "=r,{x0},{x16}",
    [ir.IntType(32)(8), ir.IntType(32)(1)], True, name="exit")
```





And that was pretty much it! The full code can be found in on my [github](https://github.com/nicoloridulfo/BrainfuckLLVM). I hope you enjoyed this post!

