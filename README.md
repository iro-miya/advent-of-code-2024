This solution uses [Bun](https://bun.sh), a fast all-in-one JavaScript runtime.

To install dependencies:

```bash
bun install
```

To run, for example, day 1 part 1:

```bash
bun run day-1/part-1/index.ts
```

Files in `input/` will be run through the function in `index.ts` and then written to `output/`.

If a file with the corresponding name exists in `check/`, then the output will be checked against it.

Note that it might appear like `runner.ts` doesn't type-check, but that's just because it uses [Promise.try](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try), which is [not in TypeScript yet](https://github.com/microsoft/TypeScript/issues/60223).
