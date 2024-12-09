function * generate(): Generator<number> {
	for (let i = 0; i < 1_000_000; i++) {
		yield i % 65535;
	}
}

console.time("Generation");
const arr = Uint16Array.from(generate());
console.timeEnd("Generation");

console.log(arr.length.toLocaleString());

console.time("Pre-allocated");
const arr2 = new Uint16Array(1_000_000);

let i = 0;

for (const result of generate()) {
	arr2[i] = result;
	i++;
}
console.timeEnd("Pre-allocated");
