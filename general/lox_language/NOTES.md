# Walkthrough

- https://craftinginterpreters.com/

## General

An interpreter first walks "up a mountain" (frontend), then walks across (middle end), then walks "down the mountain" (backend):

- Characters -> tokens: scanner / lexer, regular language, lexical analysis
- Tokens -> AST: parser, context-free grammar, syntactic analysis
- Optimize the code with series of well researched methods
- Potentially convert to an Intermediate Language for modularity
- Convert to bytecode (effectively another IL) if running in a language VM
- Convert to machine code if targetting a specific architecture

The layout of the tokens is the syntax, the behaviour of execution is the semantics.

A lot of fundamental programming problems and design patterns were formulated
due to the development of compilers.

Languages need to decide a series of things:

- Allow shadowing? i.e. do you allow assignment and initialization for variables

Recursive descent parsing walks "down" the grammar, but actually walks "up"
the precedence of the grammar rules.

- E.g. directly negating a number is a higher precedence than equality

## Expression Problem

The "expression problem" relates to having a grid of functionality, with
classes as rows and functions as columns:

Languages have difficulty adding a row or column based on their paradigm:

- Object-oriented: Adding a new function to each class
- Functional: Adding a new switch case / overload for each function

The visitor pattern helps alleviate this for object oriented languages, and
feels like black magic with compile time polymorphism.

## Interesting

An interpreter is effectively a compiler that runs the code as well

- The distinction comes from edge cases such as JIT etc.
- This might mean my build.bat is technically an interpreter with -run?
- Go allows for compiling and interpreting inherently

C originally required function declarations above usage partially due to
programs potentially not have the entire source code in memory at once.

- This is also related to whether you want to error on using undeclared variables at compile time or runtime
- If you do it at compile time this wouldn't be easy with top level functions etc.

Python explictly requires no statements inside of statements, which is why
lambda functions can only have 1 expression inside.

JS actually errors on no semi-colon and then backtracks to auto-add one in.
