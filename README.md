# TimSort
TimSort implementation in JS/ES.
Made for Educational purposes.

## What is TimSort
[TimSort](https://en.wikipedia.org/wiki/Timsort) is a [hybrid](https://en.wikipedia.org/wiki/Hybrid_algorithm) [stable](https://en.wikipedia.org/wiki/Category:Stable_sorts) [sorting algorithm](https://en.wikipedia.org/wiki/Sorting_algorithm), derived from [merge sort](https://en.wikipedia.org/wiki/Merge_sort) and [insertion sort](https://en.wikipedia.org/wiki/Insertion_sort), designed to perform well on many kinds of real-world data. It uses techniques from Peter McIlroy's "Optimistic Sorting and Information Theoretic Complexity", in Proceedings of the Fourth Annual ACM-SIAM Symposium on Discrete Algorithms, pp. 467–474, January 1993. It was implemented by Tim Peters in 2002 for use in the [Python programming language](https://en.wikipedia.org/wiki/Python_(programming_language)). The algorithm finds subsequences of the data that are already ordered, and uses that knowledge to sort the remainder more efficiently. This is done by merging an identified subsequence, called a run, with existing runs until certain criteria are fulfilled. Timsort has been Python's standard sorting algorithm since version 2.3. It is also used to sort arrays of non-primitive type in [Java SE 7](https://en.wikipedia.org/wiki/Java_7), on the [Android platform](https://en.wikipedia.org/wiki/Android_(operating_system)), and in [GNU Octave.](https://en.wikipedia.org/wiki/GNU_Octave)

## Other Details
The source code in JS was based from Google's TimSort implementation that can be seen [here](http://cr.openjdk.java.net/~martin/webrevs/openjdk7/timsort/raw_files/new/src/share/classes/java/util/TimSort.java).
The description of TimSort can be found [here](http://svn.python.org/projects/python/trunk/Objects/listsort.txt).

## Implementation
import the library:
```js
import * as TimSort from "./timsort.js";
```
The module exports the following:
```js
/**
 * This is the minimum sized sequence that will be merged.  Shorter
 * sequences will be lengthened by calling binarySort.  If the entire
 * array is less than this length, no merges will be performed.
 *
 * This constant should be a power of two.  It was 64 in Tim Peter's C
 * implementation, but 32 was empirically determined to work better in
 * this implementation.  In the unlikely event that you set this constant
 * to be a number that's not a power of two, you'll need to change the
 * {@link #minRunLength} computation.
 *
 * If you decrease this constant, you must change the stackLen
 * computation in the TimSort constructor, or you risk an
 * ArrayOutOfBounds exception.  See listsort.txt for a discussion
 * of the minimum stack length required as a function of the length
 * of the array being sorted and the minimum merge sequence length.
 */
export const MIN_MERGE = 32;
/**
 * When we get into galloping mode, we stay there until both runs win less
 * often than MIN_GALLOP consecutive times.
 */
export const MIN_GALLOP = 7;
/**
 * Maximum initial size of tmp array, which is used for merging.  The array
 * can grow to accommodate demand.
 *
 * Unlike Tim's original C version, we do not allocate this much storage
 * when sorting smaller arrays.  This change was required for performance.
 */
export const INITIAL_TMP_STORAGE_LENGTH = 256;
...
export class TimSort{
    static sortRange(a, lo, hi, c)
    static sort(a, c)
}
```
Or you can just import the class itself
```js
import {TimSort} from "./timsort.js";
```

## Usage
```js
TimSort.sort(arr, c);
```
The implementation of TimSort uses and only allows typed arrays, this does not include Object types, for better performances. Represent the array in typed arrays for much faster sorting.

The comparator function passed on the sorting function is a Number function that accepts two arguments. 
* if the comparator(a, b) is less than 0, a comes first before b.
* if the comparator(a, b) is greater than 0, b comes first before a.
* if the comparator(a, b) is equal to 0, places of the values are retained.

## Example
The example is included in the main.js file and renders its result on the index.html.
The example sorts 1024 data of unique, semi-unique, almost-sorted and reversed arrays. It also display the time it took for the sorting algorithm to finish(by using the performance.now() function, see https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)


## License
Since the original implementation was just reimplemented here, I would not take ownership of this code, thus this implementation is licensed in GLWTPL or the ["Good Luck With That Public License"](https://github.com/me-shaon/GLWTPL/blob/master/LICENSE) 


