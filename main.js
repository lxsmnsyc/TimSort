import * as TSort from "./timsort.js";

/**
 * Number of data for producing unique data
 */
const NUMBERS = 1024;
const MOD_UNIQUE = 64;
/**
 *  UNIQUE
 */
let p1 = document.getElementById("p1").getContext("2d");
let p2 = document.getElementById("p2").getContext("2d");

/**
 * container for all unique data
 */
let brr = [];

for(let i = 0; i < NUMBERS; i++){
    brr[i] = i + 1;
}

let arr = new Float32Array(NUMBERS);

let c = 0;
/**
 * Shuffles the unique data
 */
while(brr.length > 0){
    let rand = Math.floor(Math.random()*brr.length);
    arr[c++] = brr[rand];
    brr.splice(rand, 1);
}
/**
 * Draw the unsorted data
 */
for(let i = 0; i < arr.length; i++){
    p1.fillStyle = "rgb(" + arr[i] +", 0, 0)";
    p1.fillRect(i, NUMBERS - arr[i], 1, arr[i]);
}
/**
 * Record the starting time
 */
let now = performance.now();
/**
 * Sort ascending
 */
TSort.TimSort.sort(arr, (a, b) => a - b);
/**
 * Draw the sorted data
 */
for(let i = 0; i < arr.length; i++){
    p2.fillStyle = "rgb(" + arr[i] +", 0, 0)";
    p2.fillRect(i, NUMBERS - arr[i], 1, arr[i]);
}
/**
 * Log the data (if you are doubtful ;) )
 */
console.log(arr);
/**
 * Output the time
 */
now = performance.now() - now;
document.getElementById("time1").innerHTML = "Time: " + now;

/**
 *  Semi Unique
 */
let p3 = document.getElementById("p3").getContext("2d");
let p4 = document.getElementById("p4").getContext("2d");

brr = [];

for(let i = 0; i < NUMBERS; i++){
    brr[i] = i + 1;
}

arr = new Float32Array(NUMBERS);

c = 0;
/**
 * Shuffles the semi-unique data
 */
while(brr.length > 0){
    let rand = Math.floor(Math.random()*brr.length);
    arr[c++] = brr[rand] - (brr[rand] % MOD_UNIQUE);
    brr.splice(rand, 1);
}
/**
 * Draw the unsorted data
 */
for(let i = 0; i < arr.length; i++){
    p3.fillStyle = "rgb(" + arr[i] +", 0, 0)";
    p3.fillRect(i, NUMBERS - arr[i], 1, arr[i]);
}
/**
 * Record the starting time
 */
now = performance.now();
/**
 * Sort ascending
 */
TSort.TimSort.sort(arr, (a, b) => a - b);
/**
 * Draw the sorted data
 */
for(let i = 0; i < arr.length; i++){
    p4.fillStyle = "rgb(" + arr[i] +", 0, 0)";
    p4.fillRect(i, NUMBERS - arr[i], 1, arr[i]);
}
/**
 * Log the data (if you are doubtful ;) )
 */
console.log(arr);
/**
 * Output the time
 */
now = performance.now() - now;
document.getElementById("time2").innerHTML = "Time: " + now;

/**
 *  Almost Sorted
 */
let p5 = document.getElementById("p5").getContext("2d");
let p6 = document.getElementById("p6").getContext("2d");

brr = [];

for(let i = 0; i < NUMBERS; i++){
    brr[i] = i + 1;
}

arr = new Float32Array(NUMBERS);

c = 0;
/**
 * Shuffles the almost-sorted data
 */
for(let i = 0; i < NUMBERS; i++){
    arr[i] = brr[i];
}
let r = Math.floor(Math.random()*brr.length);
let tmp = arr[r];
arr[r] = arr[r + 1];
arr[r + 1] = tmp;
/**
 * Draw the unsorted data
 */
for(let i = 0; i < arr.length; i++){
    p5.fillStyle = "rgb(" + arr[i] +", 0, 0)";
    p5.fillRect(i, NUMBERS - arr[i], 1, arr[i]);
}
/**
 * Record the starting time
 */
now = performance.now();
/**
 * Sort ascending
 */
TSort.TimSort.sort(arr, (a, b) => a - b);
/**
 * Draw the sorted data
 */
for(let i = 0; i < arr.length; i++){
    p6.fillStyle = "rgb(" + arr[i] +", 0, 0)";
    p6.fillRect(i, NUMBERS - arr[i], 1, arr[i]);
}
/**
 * Log the data (if you are doubtful ;) )
 */
console.log(arr);
/**
 * Output the time
 */
now = performance.now() - now;
document.getElementById("time3").innerHTML = "Time: " + now;

/**
 *  REVERSED
 */

let p7 = document.getElementById("p7").getContext("2d");
let p8 = document.getElementById("p8").getContext("2d");

brr = [];

for(let i = 0; i < NUMBERS; i++){
    brr[i] = i + 1;
}

arr = new Float32Array(NUMBERS);

c = 0;
/**
 * Shuffles the almost-sorted data
 */
for(let i = 0; i < NUMBERS; i++){
    arr[i] = brr[NUMBERS - i - 1];
}
/**
 * Draw the unsorted data
 */
for(let i = 0; i < arr.length; i++){
    p7.fillStyle = "rgb(" + arr[i] +", 0, 0)";
    p7.fillRect(i, NUMBERS - arr[i], 1, arr[i]);
}
/**
 * Record the starting time
 */
now = performance.now();
/**
 * Sort ascending
 */
TSort.TimSort.sort(arr, (a, b) => a - b);
/**
 * Draw the sorted data
 */
for(let i = 0; i < arr.length; i++){
    p8.fillStyle = "rgb(" + arr[i] +", 0, 0)";
    p8.fillRect(i, NUMBERS - arr[i], 1, arr[i]);
}
/**
 * Log the data (if you are doubtful ;) )
 */
console.log(arr);
/**
 * Output the time
 */
now = performance.now() - now;
document.getElementById("time4").innerHTML = "Time: " + now;