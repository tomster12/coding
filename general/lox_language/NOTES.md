# Walkthrough Notes

- https://craftinginterpreters.com/

## General

An interpreter first walks "up a mountain" (frontend), then walks across (middle end), then walks "down the mountain" (backend):

- Characters -> tokens: scanner / lexer, regular language, lexical analysis
- Tokens -> AST: parser, context-free grammar, syntactic analysis
- Optimize the code with series of well researched methods
- Potentially convert to an Intermediate Language for modularity
- Convert to bytecode (effectively another IL) if running in a language VM
- Convert to machine code if targetting a specific architecture

A lot of fundamental programming problems and design patterns were formulated
due to the development of compilers.

### Expression Problem

The "expression problem" relates to having a grid of functionality, with
classes as rows and functions as columns:

Languages have difficulty adding a row or column based on their paradigm:

- Object-oriented: Adding a new function to each class
- Functional: Adding a new switch case / overload for each function

The visitor pattern helps alleviate this for object oriented languages, and
feels like black magic with compile time polymorphism.

## Interesting Ideas

An interpreter is effectively a compiler that runs the code as well

- The distinction comes from edge cases such as JIT etc.
- This might mean my build.bat is technically an interpreter with -run?
- Go allows for compiling and interpreting

C originally required function declarations above usage partially due to
programs potentially not have the entire source code in memory at once.

Python explictly requires no statements inside of statements, which is why
lambda functions can only have 1 expression inside.

JS actually errors on no semi-colon and then backtracks to auto-add one in.
