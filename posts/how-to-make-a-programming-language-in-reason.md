A while ago, Peter Norvig wrote the article [(How to Write a (Lisp) Interpreter (in Python))](http://norvig.com/lispy.html) which does a good job of showing how to build an implementation of the Lisp programming language using Python. I'm going to show how one might build the same thing using [Reason](https://reasonml.github.io/)).

If you're already familiar with Lisp you can skip ahead to [Representing Lisp values in Reason](#Representing_Lisp_values_in_Reason).

## Lisp explained

If you're not familiar with Lisp, it's basically like Javascript except you use function calls to do absolutely everything, and the syntax for a function call has the opening parenthese `(` before the name of the function being called, and function arguments are separated only by spaces, not commas.

For example the following Javascript

```js
sum(1, 2)
```

In Lisp would be:
```lisp
(sum 1 2)
```

There are no operators, just functions. For example, instead of

```js
2 + 3
```

in Lisp you would just call the `+` function:

```lisp
(+ 2 3)
```

All JS operators have function equivalents in Lisp:

| JS            | Lisp          |
| ------------- |---------------|
| a + b         | (+ a b)       |
| a - b         | (- a b)       |
| a * b         | (* a b)       |
| a / b         | (/ a b)       |
| a < b         | (< a b)       |
| a > b         | (> a b)       |
| a <= b        | (<= a b)      |
| a >= b        | (>= a b)      |
| a == b        | (eq? a b)     |
| let a = 1     | (define a 1)  |
| a = 1         | (set! a 1)    |

Also, there are no statements in Lisp: everything is an expression. If you want to do some things in sequence like

```js
let james = 25;
let alex = 26;
sum(james, alex);
```

in Lisp you would use the `begin` keyword:

```lisp
(begin
  (define james 25)
  (define alex 26)
  (sum james alex))
```

Each of the expressions which are used as an argument to `begin` is evaluated, and the result that the last one evaluates to becomes the value that the whole `begin` expression evaluates to.

Conditionals works like this too. Instead of:

```js
age < 18 ? kid : adult
```

we have:

```lisp
(if (< age 18) kid adult)
```

This simple design will make it much easier to implement our programming language.

Let's get started building our Lisp interpreter.

Our programs will be made up of values which are one of a few possible things: numbers, 'symbols' (kind of like strings), and lists (which can contain numbers, symbols and other lists).

Lisp uses lists as the main data structure of the language, but also lists used as the internal representation of the programs themselves. Why? Lists a good way to represent a function call: a function name as the first value, and the function arguments as the subsequent values. The `(sum 1 2)` example above is like a list of `['sum', 1, 2]`. Nested function calls, like `(sum 5 (* 2 3))` become `['sum', 5, ['*', 2, 3]]`. You could also think of this like a tree:

```
list
  ├── symbol: sum
  ├── number: 5
  └── list
        ├── symbol: *
        ├── number: 2
        └── number: 3
```

In addition to function calls, the other types of expressions in Lisp (like `if`, `define`, `begin`, etc) can also be represented as a list. Every Lisp program can be thought of as a bunch of nested expressions, which can be represented in our implementation as a bunch of nested lists. This tree of nested lists is called an Abstract Syntax Tree (AST).

The way a Lisp interpreter works is that the program text is input, converted into AST form, and then 'evaluated', which basically means to start at the root of the tree and work your way inward, deciding what to do with each thing you come across. If the thing is a function, you want to evaluate all the expressions given as the function's arguments, and then call the named function with those arguments. If it's something special like `if` or `define`, then you'll need some logic to do the appropriate thing. For example, for `if`, you only want to evaluate the appropriate branch of the two 'if' or 'else' branches, based on the result of the condition.

The result of all this evaluating is a final result value, which we print to the screen. And that's all there is to Lisp. It's a pretty simple language, which makes it ideal as a first programming language to have a go at implementing.

## Representing Lisp values in Reason

Representing the possible values of a Lisp program is a great use for a Reason 'variant' type:

```reason
type value =
  | NumberVal float
  | SymbolVal string
  | ListVal (list value);
```

We can implement a function to convert these values to a string:

```reason
let rec format_value value :string =>
  switch value {
  | ListVal x =>
    let formatted_items = List.map format_value x;
    let joined = String.concat " " formatted_items;
    "(" ^ joined ^ ")"
  | NumberVal x => Printf.sprintf "%.12g" x
  | SymbolVal x => x
  };
```

We can test it by creating a `ListVal` of `value`s representing the program `(+ 2 4)`:

```reason
let ast = ListVal [
  SymbolVal "+",
  NumberVal 2.,
  NumberVal 4.
];
print_endline (format_value ast);
```
This prints `(+ 2 4)`. So now we have a way to define values representing a program, and print out their value.

## Parsing and Tokens

However, we want to be able to type in code as text and have our programming language evaluate it to some result value. This means we need to implement a parser to turn the program text into an Abstract Syntax Tree represented using our `value` type. We'll do it in two stages: first we'll 'tokenize' or 'lex' the text, which means to break the text up into a list of values called 'tokens', and then a second stage to 'parse' the tokens by reading through them in sequence and turning combinations of them them into `value`s based on the 'grammar' of our language. A 'grammar' is just a set of rules which determine which sequences and combinations of tokens which are valid and meaningful in the language, just as the grammar of English determines which words can be used together and what they mean when combined in a sentence.

## The Tokenizer

Let's implement the tokenizing part. First we'll need a type to represent the possible types of tokens in our code:

```reason
type token =
  | LParenToken
  | RParenToken
  | TextToken string;
```

We have a variant each for left and right parens, and another token type for any other non-whitespace text. We don't have a token type for whitespace text, because in Lisp whitespace is only meaningful when it's delimiting symbols/numbers, and after tokenizing the code we've already extracted that information, so we don't need to know or care about the whitespace in the program text anymore.

Now for the function which does the tokenizing. Basically, we need to iterate through our input program text character-by-character, deciding looking at each character and deciding whether or not to add a new token to our tokens list.

If we think about the text of an expression like

```lisp
(hi friend)
``` 

We've got to break it into the following list of tokens:

```reason
[
  LParenToken,
  TextToken "hi",
  TextToken "friend",
  RParenToken
];
```

But what is the logic for each character of the string which will get us to this point? The possible cases we'll have to deal with are:

- the character is whitespace (eg. a space, tab, newline). This means that any previous number or symbol token finished at the previous character of the string (eg. 'hi' in `(hi friend)`), so we need to add a `TextToken` for that previous text. We don't need to add any token for the whitespace character, so we can just move on.
- the character is a left or right paren. This is similar to the whitespace character, as the paren also finishes any symbol/number token, (eg. 'friend' in `(hi friend)`), so we need to add a `TextToken` for that previous text, and then an `LParenToken` or `RParenToken` for the current character.
- any other character: we are inside a `TextToken`, but we don't yet know if we're at the end of it, so we'll keep advancing through the string until we find one of the 'delimiter' characters (parens and whitespace). We do need to keep track of the the start and end index of the input text since we've been in this text token, however, so that when we get to a delimiter we can make a `TextToken` value containing that chunk of the input text.

So here it is in code form:

```reason
type tokenize_state = {
  /* the list of tokens we're building */
  mutable tokens: list token,
  /* the index in the input text of the character we're currently at */
  mutable position: int,
  /* the index in the input text that the current token started at.  */
  mutable token_start: int
};

/* Convert a string of characters into a list of tokens. */
let tokenize input => {
  let state = {tokens: [], token_start: 0, position: 0};
  let delimiter_reached delimiter_token => {
    /* if we've accumulated a non-empty range of text between state.token_start
       and the current char, add a TextToken */
    if (state.position > state.token_start) {
      let text = String.sub input state.token_start (state.position - state.token_start);
      state.tokens = [TextToken text, ...state.tokens]
    };
    /* then add the token representing the delimiter, if provided */
    switch delimiter_token {
    | Some token => state.tokens = [token, ...state.tokens]
    | None => ()
    };
    /* advance to the next char and reset state.token_start to point
       to that char also */
    state.position = state.position + 1;
    state.token_start = state.position
  };
  /* match tokens until we reach the end of the input text */
  let input_length = String.length input;
  while (state.position < input_length) {
    let current_char = input.[state.position];
    switch current_char {
    /* parens */
    | '(' => delimiter_reached (Some LParenToken)
    | ')' => delimiter_reached (Some RParenToken)
    /* whitespace */
    | ' ' => delimiter_reached None
    | '\t' => delimiter_reached None
    | '\n' => delimiter_reached None
    | '\r' => delimiter_reached None
    /* any other text char becomes part of a text token */
    | _ =>
      /* advance to the next char. Because state.token_start is unchanged,
         this expands the range between state.token_start and state.position
         to include the current char */
      state.position = state.position + 1
    }
  };
  /* treat the end of the input string like a delimiter too */
  delimiter_reached None;
  List.rev state.tokens
};
```

We can test it out like so:

```reason

let show_token token =>
  switch token {
  | LParenToken => "LParenToken"
  | RParenToken => "RParenToken"
  | TextToken text => Printf.sprintf "TextToken \"%s\"" text
  };

let show_tokens_list tokens => String.concat ", " (List.map show_token tokens);

print_endline (show_tokens_list (tokenize "(hi friend)"));
```
Which outputs:

```
LParenToken, TextToken "hi", TextToken "friend", RParenToken
```

## The Parser

Now we have tokens, we need to turn them into values. We have two kinds of values 'atomic' values, which are the single, indivisible value types: numbers and symbols. You may contrast them with lists, which can contain other values. Parsing an atomic value from a `TextToken` like `TextToken "33"` or `TextToken "foo"` into a `value` is simple, we just take the `TextToken`'s text value and try to parse it as a float. Failing that, it must be symbol.

```reason
let atom text: value => {
  try (NumberVal (float_of_string text)) {
    | Failure "float_of_string" => {
      SymbolVal text
    };
  };
};
```

That deals with the atomic value types, but what about lists (including lists of numbers and symbols)? We need to match the token representing the start and end of a list and build up a `ListVal`. We'll also need to recursively deal with any nested lists and atomic values. We'll create a function called `read_from_tokens`, which takes a reference to a list of tokens and recursively moves along it, popping off tokens and pattern matching against them. When an `LParenToken` is reached, that's the start of a list, and we recursively call `read_list_from_tokens` until we run into a corresponding `RParenToken` marking the end of that list. `TextToken`s are passed to our `atom` function. If we run out of tokens in the middle of a list, or reach an `RParenToken` without a corresponding `LParenToken`, however, that's a parsing error.

```reason
let rec read_from_tokens (remaining_tokens: ref (list token)) =>
  switch !remaining_tokens {
  | [] => failwith "unexpected EOF while reading"
  | [LParenToken, ...rest] =>
    remaining_tokens := rest;
    read_list_from_tokens remaining_tokens []
  | [RParenToken, ...rest] => failwith "unexpected )"
  | [TextToken text, ...rest] =>
    remaining_tokens := rest;
    atom text
  }
and read_list_from_tokens remaining_tokens values_list =>
  switch !remaining_tokens {
  | [] => failwith "unexpected EOF while reading list"
  | [RParenToken, ...rest] =>
    remaining_tokens := rest;
    ListVal (List.rev values_list)
  | _ =>
    let value = read_from_tokens remaining_tokens;
    read_list_from_tokens remaining_tokens [value, ...values_list]
  };
```

Okay, so let's put it all together:

```reason
/* Read a Lisp expression from a string. */
let parse program => {
  let tokens = tokenize program;
  read_from_tokens (ref tokens)
};
```

```reason
let program_text = "(+ 4 5)";
let program_ast = parse program_text;
print_endline (format_value program_ast);
```

This prints:
```
(+ 4 5)
```

## Read Eval Print Loop

So our code has made a round trip from text, to tokens, to AST, and back to text. But it's not really much use until we can execute it. That means we have to implement the `eval` function. The eval function takes a program AST, and evaluates it to a result, possibly recursively evaluting subtrees of the AST.

The full cycle looks like this:

```
program text => [tokenize] => tokens => [read_from_tokens] => AST => [eval] => result value => [format_valueue] => result text
```

A very barebones implementation of `eval`, with only support for the arithmetic functions, would look something like this:


```reason

let unwrap_number_value (value: value) :float =>
  switch value {
  | NumberVal x => x
  | _ => failwith @@ "expected number value"
  };

let apply_arithmetic func (args: list value) :value => {
  let numbers = List.map unwrap_number_value args;
  let result = List.fold_left func (List.hd numbers) (List.tl numbers);
  NumberVal result
};

let rec eval value =>
  switch value {
  | NumberVal _ => value
  | ListVal [SymbolVal name_to_call, ...args] =>
    let evaluated_args = List.map (fun arg => eval arg) args;
    switch name_to_call {
    | "+" => apply_arithmetic (+.) evaluated_args
    | "-" => apply_arithmetic (-.) evaluated_args
    | "*" => apply_arithmetic ( *. ) evaluated_args
    | "/" => apply_arithmetic (/.) evaluated_args
    | _ => failwith "unknown function"
    }
  | _ => failwith "unknown list form"
  };
```

Then, to tie together `parse` and `eval` into a command prompt we can type code into and get results back from, here is the 'read eval print loop':

```reason
let read_eval_print program => {
  let program_value = parse program;
  let result = eval program_value;
  let result_formatted = format_val result;
  print_endline ("=> " ^ result_formatted)
};

let read_eval_print_loop () =>
  while true {
    print_string "lisp.re> ";
    let input = read_line ();
    try (read_eval_print (String.trim input)) {
    | Failure message => print_endline ("error: " ^ message)
    }
  };

read_eval_print_loop ();
```

Running the program will now show a prompt at which you may enter an expression to be evaluated:

```
lisp.re> (+ 3 4)
=> 7
lisp.re> (* 3 4 (+ 4 4))
=> 96
```

## Variables and Environments



