---
layout: "@layouts/BlogLayout.astro"
---

# Building a Blockchain from scratch

What will be covered

- My goals
- What is a blockchain
- Building a blockchain from scratch
- My implementation
- Future development
- Appendix A

## Goals

My goal with this post and the code I have and will be writing is to get a solid understanding of how blockchains and crypto currencies work from the ground up. There is no better way to learn something that by doing it yourself.
Firstly, I will implement a blockchain (this post), thereafter I will use the blockchain to build a distributed ledger and finally I shall build a crypto currency.

## What is a blockchain

A blockchain is essentially just a linked list with extra features. These features make it hard to tamper with the data and easy to check the validity of the data. People use blockchains for many things. Most popularly for crypto currencies. Since it is anonymous individuals that manage the creation and validation of transactions. One wouldn't want someone to go back and change their account balance in order to make them rich. The currency is safe for as long as most individuals are honest.

## Implementing a Blockchain
We will now implement a blockchain from scratch. To illustrate this, we will first implement a simple linked list and then build upon it until it becomes a blockchain.
### Linked List
As the name suggests a linked list is a list where the data is linked together. An array on the other hand is data in memory stored in adjacent memory addresses.
Note that the usual term for the object that stores the data in a linked list is `node`, however in blockchains the term is `block`.

Normally one would implement a singly linked list like this:


```python
class Node:
    next_node = None
    def __init__(self,
                data:str=None):
        self.data = data

class LinkedList:
    head=None
    def add(self, data:str):
        if self.head:
            current_node = self.head
            while current_node.next_node:
                current_node = current_node.next_node
            current_node.next_node = Node(data)
        else:
            # The first node gets an empty string as prevous hash because there are not previous nodes
            self.head = Node(data)
```

The problem with a simple linked list is that you can change the data anywhere in the list. Like so:


```python
linked_list = LinkedList()
for n in range(10):
    linked_list.add(str(n))

# Change the value of the third node
linked_list.head.next_node.next_node.data = 12897
```

### Adding the hash of the previous block
We do not want anyone to change the data, so we add the hash of the previous node to the next node's fields. Now to check if the data in a node has been tampered with, we just recompute the hash of the previous node and compare with the current nodes "hash of the previous block".

A quick refresher about hashes. A hash is the output of a hash function. Sometimes referred to as a fingerprint of some piece of data. A hash function is a so called "one way" function. You can easily compute the hash of a piece of data, but it is very hard to go from the hash to the original piece of data. The only way is to use "brute-force" and try all different combinations of inputs.  If the original piece of data is longer than the hash, it is impossible since information has been lost. As shown in the example below, just a small change in the input creates a completely different output. Despite this, the function is non probabilistic, which means that a input will **always** have the same output.


```python
from hashlib import sha256
def hasher(input: str):
    return sha256(input.encode()).hexdigest()
print(hasher("Hello World"))
print(hasher("Hello World!"))
```

    a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
    7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069


To add the hash of the previous block we add the field `previous_node_hash` to the node.


```python
class Node:
    next_node = None
    def __init__(self, previous_node_hash:str, data:str=None):
        self.data = data
        self.previous_node_hash = previous_node_hash
        
class LinkedList:
    head=None
    def add(self, data:str):
        if self.head:
            current_node = self.head
            while current_node.next_node:
                current_node = current_node.next_node
                
            current_node_hash = sha256(str(current_node.__dir__).encode()).hexdigest() # <-----
            current_node.next_node = Node(current_node_hash, data)
        else:
            self.head = Node("", data) 
```

A node now looks like this when printed


```python
linked_list = LinkedList()
for n in range(10):
    linked_list.add(str(n))
print(linked_list.head.next_node.__dict__)
```

    {'data': '1', 'previous_node_hash': '0e69ce586d540294b97a90e1f224ffd1af1d672007cea72221fc18955550051e', 'next_node': <__main__.Node object at 0x108c045e0>}


We now have officially created the most basic blockchain! Now, you can still change the value of `Node.data`. But that would make the next node's `Node.prevous_node_hash` incorrect. So, you would have to recompute the hash of the edited node and update the next node. However, now the hash in the following node does not match the one after that. You would have to change all the hashes until you arrive at the last node. In the case of crypto currencies, imagine that it takes monstrous amount of computation to add just a single node to the list and you start to realize why it is infeasible to edit the record. While you are changing the record and recomputing the whole chain, hundreds of thousands of computers are trying to add new nodes to the end of chain. You would never catch up.

Bitcoin and PyChain split the information in the node (from now on referred to as block) into two sections: a header and a body. This is done in order to save space and computation. For a lot of operations, you do not need the body; you just need a hash of it in order to validate the data should you want to.

Since PyChain is a general purpose blockchain, it can also discard some header fields that are present in bitcoin's header. For example: version, difficulty target and nonce. All of these are application specific and are important for bitcoin, but not to PyChain. Perhaps a field could be added to PyChain's header that could be used to store some information.

### Implementing PyChain
PyChain is extremely simple, let's implement part of it:
#### Block
A block is defined as follows:
```
======HEADER==========
4 bytes    (I): block number       : 0:4
32 bytes (32s): previous block hash: 4:36
32 bytes (32s): block body hash    : 36:68
8 bytes    (Q): block creation time: 68:76
======END HEADER======
======BODY============
n bytes   (ns): block body         : 76:n
======END BODY========
```
The index of the block in the chain, the previous block's hash, the hash of the body, the time when the block was created and the body. The header is of fixed size, always 76 bytes. However, the body has a variable size, but is easy to compute: `len(block)-76`.

PyChain uses [struct](https://docs.python.org/3/library/struct.html) in order to encode and decode blocks.
```Python
import struct # a library to create C-style structs

def encode_block(n: int, prev_hash: bytes, time: int, body: str):
    """
    Encode a block
    Packs the block into an array of bytes
    :param n: block number
    :param prev_hash: previous block hash
    :param time: time of block creation
    :param body: block body
    """
    block = struct.pack(f"=I32s32sQ{len(body)}s", n, prev_hash, sha256(body.encode()).digest(), time, body.encode())
    return block

def decode_block(block: bytes):
    """
    Decode a block
    Unpacks the block into an array of bytes
    Note: the 76 in the format string is the length of the header
    :param block: block to decode
    """
    n, prev_hash, body_hash, time, body = struct.unpack(
        f"=I32s32sQ{len(block)-76}s", block)
    return n, prev_hash, body_hash, time, body.decode()
```


These functions basically just take several values and either packs or unpacks them in order to achieve a C-like space efficiency. Easy as that. If you are unfamiliar with this library this is how it works:


```python
import struct
print(struct.pack("2I", 123, 456))
```

    b'{\x00\x00\x00\xc8\x01\x00\x00'



```python
print(struct.unpack("2I", b'{\x00\x00\x00\xc8\x01\x00\x00'))
```

    (123, 456)


The format of a block is `I32s32sQ{len(body)}s`. Where `I`s are integers, `s`s are char arrays and `Q`s are unsigned longs. The number before the letter specifies how many of that type there are. Since the body has a variable number of `s`, it can be calculated using `{len(block)-76}s`.

To add a block to the chain we simply: 
```Python
class BlockChain:
    blocks=[]
    HEADER_SLICE = slice(0, 76)

    def add_block(self, body: str):
        if len(blocks)==0: raise Exception("No genesis block")
        prev_header = self.blocks[-1][self.HEADER_SLICE] # Get the header of the previous block
        prev_hash = sha256(prev_header).digest()
        block = self.encode_block(
            len(self.blocks), prev_hash, int(time()), body)
        self.blocks.append(block)
```
### Performance of PyChain
#### Speed
Since adding a block to the chain simply requires you to compute one hash and pack the data it is extremely fast. It takes only 24ms to add 10K blocks to the chain. That is 2.352 microseconds per block. The reason distributed blockchains take so long (approx. 10min for bitcoin) is because consensus is needed. In bitcoins case, to add one block hundreds of thousands of computers need to find a value that results in the header's hash starting with n number of zeros. The number of calculations needed to do this are astronomical.
#### Space
A blockchain containing 10K blocks (with empty bodies) would be `10000 blocks x 76 bytes = 760 KB`. This is slightly better than bitcoin which has a header of 80 bytes.

## Future development
PyChain needs some unit tests and more chain validation features in order to move to the next step.


The following step is to create a peer-to-peer protocol that would enable this blockchain implementation to be distributed. Of the top of my head, that would require the following abilities:
- broadcast new block
- get blocks (ask for blocks from peers)

### Appendix A
Fun fact! The [current version of PyChain](https://github.com/ridulfo/PyChain/tree/713a4a5a4e8055d1a127ff3d0c26f0b3efa737c7) can be minified and fit in 31 **unreadable** lines of code:


```python
O, N, M, L, H, B, C = round, staticmethod, isinstance, range, print, slice, len
from hashlib import sha256 as E
from time import time as G
import struct as D
from typing import List
class K:
    blocks=[];HEADER_SLICE=B(4,80);BLOCK_NR_SLICE=B(4,8);PREV_HASH_SLICE=B(8,40);BODY_HASH_SLICE=B(40,72);BLOCK_CREATION_TIME_SLICE=B(72,80);BODY_SLICE=B(80,None)
    def add_block(A,body):B=A.blocks[-1][A.HEADER_SLICE];D=E(B).digest();F=A.encode_block(C(A.blocks),D,int(G()),body);A.blocks.append(F)
    def verify_chain(A):
        P='=Q';O=True;F=False
        if C(A.blocks)==0:return O
        for B in L(1,C(A.blocks)):
            G=E(A.blocks[B-1][A.HEADER_SLICE]).digest();H=A.blocks[B][A.PREV_HASH_SLICE]
            if G!=H:return F
            I=A.blocks[B][A.BODY_HASH_SLICE];J=E(A.blocks[B][A.BODY_SLICE]).digest()
            if I!=J:return F
            K=D.unpack('=I',A.blocks[B][A.BLOCK_NR_SLICE])[0]
            if K!=B:return F
            M=D.unpack(P,A.blocks[B-1][A.BLOCK_CREATION_TIME_SLICE])[0];N=D.unpack(P,A.blocks[B][A.BLOCK_CREATION_TIME_SLICE])[0]
            if N<M:return F
        return O
    def import_chain(B,chain):
        A=chain
        if M(A,list):B.blocks=A
        elif M(A,bytes):B.blocks=[A]
        else:raise Exception('Invalid import data')
    def export_chain(A):return A.blocks
    @N
    def encode_block(n,prev_hash,time,body):A=body;B=D.pack(f"=2I32s32sQ{C(A)}s",C(A),n,prev_hash,E(A.encode()).digest(),time,A.encode());return B
    @N
    def decode_block(block):A=block;B,E,F,G,H,I=D.unpack(f"=2I32s32sQ{C(A)-80}s",A);return B,E,F,G,H,I.decode()
```

