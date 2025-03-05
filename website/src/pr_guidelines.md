# Contributing Guidelines

These guidelines apply to all of my projects

## Code of Conduct
There is no official Code of Conduct in the Standard. Be reasonable and respectful.

## Filing Issues
When you file a bug report or suggestion, you are contributing to the project :)

There is this sentiment spreading on the Internet that users of open-source
likes to ask for more without contributing. While people like that do exist,
I prefer to think of more ask = more people caring and liking and using about my project.

The catch is - you have to show that. If you are filing a bug report, please
take the time to detail what is the scenario and what's the steps to reproduce,
along with expected v.s. actual outcome. If it's a feature suggestion, give the background
context or use cases for why you think the feature should be added.

Do not comment on whether you think it's a simple thing or not.
(i.e. "Why is this simple fix not done yet?" or "This feature should be easy, why not just add it?")
As a user and not a maintainer of the project, you are simply not in the position to
make such call. If you have looked into the issue and implemented the "simple fix",
then prove yourself by a PR or reply in the issue.

## Communication
Communication is very important. When you are not sure, ask. Also reach out with your feature
idea before you work on a PR. It's also a good idea to let me know your availability
if you are going to work on something big.

## Coding
Follow each language's best practice and convention when it comes to styles.
The easiest way to do this is look at existing code and use the linters often.

## Documentation
Code without documentation will quickly become unworkable. The rule of thumb is
I should be able to tell what a function/component does without looking at the implementation.

This is something that requires pretty high skill level and experience to do effectively.
It's very common even for large, widely-used projects to not do this properly,
and it's frustrating to having to dig into the code or setup a minimal environment
to find out what the function returns for, say, empty string.

For example, this function:
```typescript
/** Parses a number from an input string */
function parseNumber(input: string): number {
    ... // implementation hidden
}
```
Yes - there is documentation, but it's useless. I already know that before I look at the comment.
Here are my questions:
- What's the output? Integer? Float? Positive Numbers?
- What's the input? Decimal? Hex? Math expression? Automatically detected?
- What if the input is invalid? Does it return 0? -1? NaN? throw an error?

A good documentation looks like this
```typescript
/** 
 * Parses a number from an input string.
 *
 * The input should be string representation of a positive integer in decimal.
 * If anything other than 0-9 is in the input, it returns 0.
 * Leading 0's are ignored, and an empty string also gives 0
 */
function parseNumber(input: string): number {
    ... // implementation hidden
}
```

Another good rule of thumb is that one should be able to write tests
for the function by looking at the documentation. Actually, tests *are* documentation.
They express in code instead of natural language or what the behavior of a function or component
is.

```admonish warning
DO NOT use LLM to generate documentation comments!!!!

LLMs lack the context that YOU, as the developer, know. They cannot generate effective documentation
unless you tell them the context, which takes more effort than you just writing the comment yourself.
You can however, write the comment and ask LLM to reword it to sound more fluent,
say if English is not your first language.

For example, here's my prompt:
- "Can you generate documentation for this function? It reduces the payload to avoid hittimg payload limit: function getMinimalPayload(): string;"

This is the output:

    /**
     * Generates a minimal payload to optimize data transmission and prevent exceeding server payload limits.
     *
     * This function constructs a compact string representation of the payload, ensuring 
     * only essential data is included to reduce the request size.
     *
     * @returns {string} - A minimized payload string that the server can efficiently process.
     *
     * @example
     * const payload = getMinimalPayload();
     * console.log(payload); // Output: A compact string representation of the payload
     *
     * @remarks
     * - The function should be used when sending requests with strict payload size limits.
     * - Ensure that essential data is not lost while minimizing the payload.
     */
    function getMinimalPayload(): string;

These words are useless, and very obviously emitted by LLM without sufficient context.
What is "minimal payload"? What's the format? What is left out? What is not left out?
Documentation that pretends to be there is worse than no documentation. I have to spend
brain power processing junk instead of actually looking for what I need.
```

## Before Pull Request
Always run checks and tests before you make a Pull Request. PR workflows need
to be approved by me to run because of security. If very simple formatting
issue fails the build and I was not there, you have to wait for another cycle
of review.

I don't use git hooks, also because of security.

## Pull Request
When opening a PR, make sure the description is filled.
Small PRs can have a one-to-two sentence description. If you are fixing a bug,
describe what the bug is or link to the issue, explain the root cause, and explain
the fix.

Also please explain how the changes have been validated, for example tested in local
dev server. The automated tests can't always catch all the bugs.
