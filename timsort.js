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

/**
 * Simple Implementation of Insertion Sort
 */

function insertionSort(a, lo, hi, c){
    for(let i = lo; i < hi; i++){
        let val = a[i],
            j = i - 1;

        while(j >= 0 && c(a[j], val) > 0){
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = val;
    }
}

let isNumber = a => typeof a === "number";

let raise = (bool, msg) => {
    if(bool) throw msg;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const frame = 1000/64;
let count = 0;
function arrayCopy(src, srcPos, des, desPos, len){
    if(src === des){
        src = new src.constructor(src);
    }
    for(let i = 0; i < len; i++){
        if(srcPos + i < src.length){
            des[desPos + i] = src[srcPos + i];

        }
    }
}

function rangeCheck(index, from, to){
    raise(from > to, "IllegalArgumentException: from (" + from + ") > to(" + to + ")");
    raise(from < 0, "ArrayIndexOutOfBoundsException: from(" + from + ")");
    raise(to > index, "ArrayIndexOutOfBoundsException: to(" + to + ")");
}

/**
 * Ensures that the external array tmp has at least the specified
 * number of elements, increasing its size if necessary.  The size
 * increases exponentially to ensure amortized linear time complexity. 
 * @param {TimSort} tim 
 * @param {Number} minCapacity 
 * @returns {Array}
 */
function ensureCapacity(tim, minCapacity){

    let tmp = tim.tmp;
    if (tmp.length < minCapacity) {
        // Compute smallest power of 2 > minCapacity
        let newSize = minCapacity;
        newSize |= newSize >> 1;
        newSize |= newSize >> 2;
        newSize |= newSize >> 4;
        newSize |= newSize >> 8;
        newSize |= newSize >> 16;
        newSize++;

        if (newSize < 0) // Not bloody likely!
            newSize = minCapacity;
        else
            newSize = Math.min(newSize, tim.arr.length >>> 1);

        let newArray = new tim.T(newSize);
        tmp = newArray;
    }
    return tmp;
}

/**
 * Locates the position at which to insert the specified key into the
 * specified sorted range; if the range contains an element equal to key,
 * returns the index of the leftmost equal element.
 * 
 * @param {Object} key 
 * @param {Array} a 
 * @param {Number} base 
 * @param {Number} len 
 * @param {Number} hint 
 * @param {Number} c 
 * @returns {Number}
 */
function gallopLeft(key, a, base, len, hint, c){
    //assert len > 0 && hint >= 0 && hint < len;
    let lastOfs = 0,
        ofs = 1;
        if (c(key, a[base + hint]) > 0) {
            // Gallop right until a[base+hint+lastOfs] < key <= a[base+hint+ofs]
            let maxOfs = len - hint;
            while (ofs < maxOfs && c(key, a[base + hint + ofs]) > 0) {
                lastOfs = ofs;
                ofs = (ofs << 1) + 1;
                if (ofs <= 0){
                    ofs = maxOfs;// int overflow
                }   
            }
            if (ofs > maxOfs){
                ofs = maxOfs; // int overflow
            } 

            // Make offsets relative to base
            lastOfs += hint;
            ofs += hint;
        } else {// key <= a[base + hint]
            // Gallop left until a[base+hint-ofs] < key <= a[base+hint-lastOfs]
            let maxOfs = hint + 1;
            while (ofs < maxOfs && c(key, a[base + hint - ofs]) <= 0) {
                lastOfs = ofs;
                ofs = (ofs << 1) + 1;
                if (ofs <= 0){
                    ofs = maxOfs; // int overflow
                } 
            }
            if (ofs > maxOfs){
                ofs = maxOfs;
            } 

            // Make offsets relative to base
            let tmp = lastOfs;
            lastOfs = hint - ofs;
            ofs = hint - tmp;
        }
        //assert -1 <= lastOfs && lastOfs < ofs && ofs <= len;

        /*
         * Now a[base+lastOfs] < key <= a[base+ofs], so key belongs somewhere
         * to the right of lastOfs but no farther right than ofs.  Do a binary
         * search, with invariant a[base + lastOfs - 1] < key <= a[base + ofs].
         */

        lastOfs++;
        while (lastOfs < ofs) {
            let m = lastOfs + ((ofs - lastOfs) >>> 1);

            if (c(key, a[base + m]) > 0){
                lastOfs = m + 1; // a[base + m] < key 
            } else{
                ofs = m;          // key <= a[base + m]
            } 
        }
        //assert lastOfs == ofs;    // so a[base + ofs - 1] < key <= a[base + ofs]
        
        return ofs;
}
/**
 * 
 * Like gallopLeft, except that if the range contains an element equal to
 * key, gallopRight returns the index after the rightmost equal element.
 * @param {Object} key 
 * @param {Array} a 
 * @param {Number} base 
 * @param {Number} len 
 * @param {Number} hint 
 * @param {Function} c 
 * @returns {Number}
 */
function gallopRight(key, a, base, len, hint, c){
    
    //assert len > 0 && hint >= 0 && hint < len;
    let ofs = 1,
        lastOfs = 0;
    if (c(key, a[base + hint]) < 0) {
        // Gallop left until a[b+hint - ofs] <= key < a[b+hint - lastOfs]
        let maxOfs = hint + 1;
        while (ofs < maxOfs && c(key, a[base + hint - ofs]) < 0) {
            lastOfs = ofs;
            ofs = (ofs << 1) + 1;
            if (ofs <= 0){
                ofs = maxOfs; // int overflow
            }  
        }
        if (ofs > maxOfs){
            ofs = maxOfs;
        } 

        // Make offsets relative to b
        let tmp = lastOfs;
        lastOfs = hint - ofs;
        ofs = hint - tmp;
    } else {// a[b + hint] <= key
        // Gallop right until a[b+hint + lastOfs] <= key < a[b+hint + ofs]
        let maxOfs = len - hint;
        while (ofs < maxOfs && c(key, a[base + hint + ofs]) >= 0) {
            lastOfs = ofs;
            ofs = (ofs << 1) + 1;
            if (ofs <= 0){
                ofs = maxOfs; // int overflow
            } 
        }
        if (ofs > maxOfs){
            ofs = maxOfs;
        } 
        // Make offsets relative to b
        lastOfs += hint;
        ofs += hint;
    }
    // assert -1 <= lastOfs && lastOfs < ofs && ofs <= len;
    /*
    * Now a[b + lastOfs] <= key < a[b + ofs], so key belongs somewhere to
    * the right of lastOfs but no farther right than ofs.  Do a binary
    * search, with invariant a[b + lastOfs - 1] <= key < a[b + ofs].
    */
    lastOfs++;
    while (lastOfs < ofs) {
        let m = lastOfs + ((ofs - lastOfs) >>> 1);

        if (c(key, a[base + m]) < 0){
            ofs = m;          // key < a[b + m]
        }
        else{
            lastOfs = m + 1;  // a[b + m] <= key
        }
            
    }
    //assert lastOfs == ofs;    // so a[b + ofs - 1] <= key < a[b + ofs]
    return ofs;
}


/**
 * Merges two adjacent runs in place, in a stable fashion.  The first
 * element of the first run must be greater than the first element of the
 * second run (a[base1] > a[base2]), and the last element of the first run
 * (a[base1 + len1-1]) must be greater than all elements of the second run.
 *
 * For performance, this method should be called only when len1 <= len2;
 * its twin, mergeHi should be called if len1 >= len2.  (Either method
 * may be called if len1 == len2.)
 * 
 * @param {TimSort} tim 
 * @param {Number} base1 
 * @param {Number} len1 
 * @param {Number} base2 
 * @param {Number} len2 
 */
 function mergeLo(tim, base1, len1, base2, len2){
    //assert len1 > 0 && len2 > 0 && base1 + len1 == base2;

    // Copy first run into temp array
    let a = tim.arr, // For performance
        tmp = ensureCapacity(tim, len1);
    arrayCopy(a, base1, tmp, 0, len1);

    let cursor1 = 0,       // Indexes into tmp array
        cursor2 = base2,   // Indexes int a
        dest = base1;      // Indexes int a

    // Move first element of second run and deal with degenerate cases
    a[dest++] = a[cursor2++];
    if (--len2 == 0) {
        arrayCopy(tmp, cursor1, a, dest, len1);
        return;
    }
    if (len1 == 1) {
        arrayCopy(a, cursor2, a, dest, len2);
        a[dest + len2] = tmp[cursor1]; // Last elt of run 1 to end of merge
        return;
    }

    let c = tim.comparator,  // Use local variable for performance
        minGallop = tim.minGallop;    //  "    "       "     "      "
outer:
    while (true) {
        let count1 = 0, // Number of times in a row that first run won
            count2 = 0; // Number of times in a row that second run won

        /*
            * Do the straightforward thing until (if ever) one run starts
            * winning consistently.
            */
        do {
            //assert len1 > 1 && len2 > 0;
            if (c(a[cursor2], tmp[cursor1]) < 0) {
                a[dest++] = a[cursor2++];
                count2++;
                count1 = 0;
                if (--len2 == 0){
                    break outer;
                }
            } else {
                a[dest++] = tmp[cursor1++];
                count1++;
                count2 = 0;
                if (--len1 == 1){
                    break outer;
                }
            }
        } while ((count1 | count2) < minGallop);

        /*
            * One run is winning so consistently that galloping may be a
            * huge win. So try that, and continue galloping until (if ever)
            * neither run appears to be winning consistently anymore.
            */
        do {
            //assert len1 > 1 && len2 > 0;
            count1 = gallopRight(a[cursor2], tmp, cursor1, len1, 0, c);
            if (count1 != 0) {
                arrayCopy(tmp, cursor1, a, dest, count1);
                dest += count1;
                cursor1 += count1;
                len1 -= count1;
                if (len1 <= 1){ // len1 == 1 || len1 == 0
                    break outer;
                }
            }
            a[dest++] = a[cursor2++];
            if (--len2 === 0){
                break outer;
            }

            count2 = gallopLeft(tmp[cursor1], a, cursor2, len2, 0, c);
            if (count2 != 0) {
                arrayCopy(a, cursor2, a, dest, count2);
                dest += count2;
                cursor2 += count2;
                len2 -= count2;
                if (len2 == 0){
                    break outer;
                }
            }
            a[dest++] = tmp[cursor1++];

            if (--len1 == 1){
                break outer;
            }
            minGallop--;
        } while (count1 >= MIN_GALLOP | count2 >= MIN_GALLOP);
        if (minGallop < 0){
            minGallop = 0;
        }
        minGallop += 2;  // Penalize for leaving gallop mode
    }  // End of "outer" loop
    tim.minGallop = minGallop < 1 ? 1 : minGallop;  // Write back to field

    if (len1 == 1) {
        //assert len2 > 0;
        arrayCopy(a, cursor2, a, dest, len2);
        a[dest + len2] = tmp[cursor1]; //  Last elt of run 1 to end of merge
    } else if (len1 == 0) {
        raise(true, "IllegalArgumentException: Comparison method violates its general contract! Lo");
    } else {
        //assert len2 == 0;
        //assert len1 > 1;
        arrayCopy(tmp, cursor1, a, dest, len1);
    }
    //assert len1 > 0 && len2 > 0 && base1 + len1 == base2;
}

/**
 * Like mergeLo, except that this method should be called only if
 * len1 >= len2; mergeLo should be called if len1 <= len2.  (Either method
 * may be called if len1 == len2.)
 * @param {TimSort} tim 
 * @param {Number} base1 
 * @param {Number} len1 
 * @param {Number} base2 
 * @param {Number} len2 
 */
function mergeHi(tim, base1, len1, base2, len2){
    //assert len1 > 0 && len2 > 0 && base1 + len1 == base2;

    // Copy second run into temp array
    let a = tim.arr, // For performance
        tmp = ensureCapacity(tim, len2);
    arrayCopy(a, base2, tmp, 0, len2);

    let cursor1 = base1 + len1 - 1,  // Indexes into a
        cursor2 = len2 - 1,          // Indexes into tmp array
        dest = base2 + len2 - 1;     // Indexes into a

    // Move last element of first run and deal with degenerate cases
    a[dest--] = a[cursor1--];
    if (--len1 == 0) {
        arrayCopy(tmp, 0, a, dest - (len2 - 1), len2);
        return;
    }
    if (len2 == 1) {
        dest -= len1;
        cursor1 -= len1;
        arrayCopy(a, cursor1 + 1, a, dest + 1, len1);
        a[dest] = tmp[cursor2];
        return;
    }

    let c = tim.comparator,  // Use local variable for performance
        minGallop = tim.minGallop;    //  "    "       "     "      "
outer:
    while (true) {
        let count1 = 0, // Number of times in a row that first run won
            count2 = 0; // Number of times in a row that second run won

        /*
            * Do the straightforward thing until (if ever) one run
            * appears to win consistently.
            */
        do {
            //assert len1 > 0 && len2 > 1;
            if (c(tmp[cursor2], a[cursor1]) < 0) {
                a[dest--] = a[cursor1--];
                count1++;
                count2 = 0;
                if (--len1 == 0){
                    break outer;
                }
            } else {
                a[dest--] = tmp[cursor2--];
                count2++;
                count1 = 0;
                if (--len2 == 1){
                    break outer;
                }
            }
        } while ((count1 | count2) < minGallop);

        /*
            * One run is winning so consistently that galloping may be a
            * huge win. So try that, and continue galloping until (if ever)
            * neither run appears to be winning consistently anymore.
            */
        do {
            //assert len1 > 0 && len2 > 1;
            count1 = len1 - gallopRight(tmp[cursor2], a, base1, len1, len1 - 1, c);
            if (count1 != 0) {
                dest -= count1;
                cursor1 -= count1;
                len1 -= count1;
                arrayCopy(a, cursor1 + 1, a, dest + 1, count1);
                if (len1 == 0){
                    break outer;
                }
            }
            a[dest--] = tmp[cursor2--];
            if (--len2 == 1){
                break outer;
            }

            count2 = len2 - gallopLeft(a[cursor1], tmp, 0, len2, len2 - 1, c);
            if (count2 != 0) {
                dest -= count2;
                cursor2 -= count2;
                len2 -= count2;
                arrayCopy(tmp, cursor2 + 1, a, dest + 1, count2);
                if (len2 <= 1){  // len2 == 1 || len2 == 0
                    break outer;
                }
            }
            a[dest--] = a[cursor1--];
            if (--len1 == 0){
                break outer;
            }
            minGallop--;
        } while (count1 >= MIN_GALLOP | count2 >= MIN_GALLOP);
        if (minGallop < 0){
            minGallop = 0;
        }
        minGallop += 2;  // Penalize for leaving gallop mode
    }  // End of "outer" loop
    tim.minGallop = minGallop < 1 ? 1 : minGallop;  // Write back to field

    if (len2 == 1) {
        //assert len1 > 0;
        dest -= len1;
        cursor1 -= len1;
        arrayCopy(a, cursor1 + 1, a, dest + 1, len1);
        a[dest] = tmp[cursor2];  // Move first elt of run2 to front of merge
    } else if (len2 == 0) {
        raise(true, "IllegalArgumentException: Comparison method violates its general contract! Lo");
    } else {
        //assert len1 == 0;
        //assert len2 > 0;
        arrayCopy(tmp, 0, a, dest - (len2 - 1), len2);
    }
}
/**
 * Merges the two runs at stack indices i and i+1.  Run i must be
 * the penultimate or antepenultimate run on the stack.  In other words,
 * i must be equal to stackSize-2 or stackSize-3.
 * 
 * @param {TimSort} tim 
 * @param {Number} i 
 */
 function mergeAt(tim, i){
    // assert stackSize >= 2;
    // assert i >= 0;
    // assert i == stackSize - 2 || i == stackSize - 3;
    let runBase = tim.runBase,
        runLen = tim.runLen,
        arr = tim.arr,
        c = tim.comparator;
    let base1 = runBase[i],
        len1 = runLen[i],
        base2 = runBase[i + 1],
        len2 = runLen[i + 1];
    //assert len1 > 0 && len2 > 0;
   // assert base1 + len1 == base2;

    /*
     * Record the length of the combined runs; if i is the 3rd-last
     * run now, also slide over the last run (which isn't involved
     * in this merge).  The current run (i+1) goes away in any case.
     */
    runLen[i] = len1 + len2;
    if (i === tim.stackSize - 3) {
        runBase[i + 1] = runBase[i + 2];
        runLen[i + 1] = runLen[i + 2];
    }
    tim.stackSize--;

    /*
     * Find where the first element of run2 goes in run1. Prior elements
     * in run1 can be ignored (because they're already in place).
     */
    let k = gallopRight(arr[base2], arr, base1, len1, 0, c);
    //assert k >= 0;
    base1 += k;
    len1 -= k;
    if (len1 === 0){
        return;
    }

    /*
     * Find where the last element of run1 goes in run2. Subsequent elements
     * in run2 can be ignored (because they're already in place).
     */
    len2 = gallopLeft(arr[base1 + len1 - 1], arr, base2, len2, len2 - 1, c);
    if (len2 === 0){
        return;
    }
    
    // Merge remaining runs, using tmp array with min(len1, len2) elements
    if (len1 <= len2){
        mergeLo(tim, base1, len1, base2, len2);
    } 
    else {
        mergeHi(tim, base1, len1, base2, len2);
    }
}
/**
 * Examines the stack of runs waiting to be merged and merges adjacent runs
 * until the stack invariants are reestablished:
 *
 *     1. runLen[i - 3] > runLen[i - 2] + runLen[i - 1]
 *     2. runLen[i - 2] > runLen[i - 1]
 *
 * This method is called each time a new run is pushed onto the stack,
 * so the invariants are guaranteed to hold for i < stackSize upon
 * entry to the method.
 * @param {TimSort} tim 
 */
 function mergeCollapse(tim){
    let runLen = tim.runLen;
    while (tim.stackSize > 1) {
        let n = tim.stackSize - 2;
        if (n > 0 && runLen[n-1] <= runLen[n] + runLen[n+1]) {
            if (runLen[n - 1] < runLen[n + 1]){
                n--;
            }
            mergeAt(tim, n);
        } else if (runLen[n] <= runLen[n + 1]) {
            mergeAt(tim, n);
        } else {
            break; // Invariant is established
        }
    }
}
/**
 * Merges all runs on the stack until only one remains.  This method is
 * called once, to complete the sort.
 * @param {TimSort} tim 
 */
 function mergeForceCollapse(tim){
    let runLen = tim.runLen;
    while (tim.stackSize > 1) {
        let n = tim.stackSize - 2;
        if (n > 0 && runLen[n - 1] < runLen[n + 1]){
            n--;
        }
        mergeAt(tim, n);
    }
}
/**
 * Pushes the specified run onto the pending-run stack.
 * @param {TimSort} tim 
 * @param {Number} runBase 
 * @param {Number} runLen 
 */
function pushRun(tim, runBase, runLen){
    let stackSize = tim.stackSize;
    tim.runBase[stackSize] = runBase;
    tim.runLen[stackSize] = runLen;
    tim.stackSize++;
}
/**
 * Returns the minimum acceptable run length for an array of the specified
 * length. Natural runs shorter than this will be extended with
 * {@link binarySort}.
 *
 * Roughly speaking, the computation is:
 *
 *  If n < MIN_MERGE, return n (it's too small to bother with fancy stuff).
 *  Else if n is an exact power of 2, return MIN_MERGE/2.
 *  Else return an int k, MIN_MERGE/2 <= k <= MIN_MERGE, such that n/k
 *   is close to, but strictly less than, an exact power of 2.
 *
 * For the rationale, see listsort.txt.
 * @param {Number} n 
 */
function minRunLength(n){
    let r = 0;      // Becomes 1 if any 1 bits are shifted off
    while (n >= MIN_MERGE) {
        r |= (n & 1);
        n >>= 1;
    }
    return n + r;
}

/**
 * Reverse the specified range of the specified array.
 * @param {Array} a 
 * @param {Number} lo 
 * @param {Number} hi 
 */
function reverseRange(a, lo, hi){
    hi--;
    while (lo < hi) {
        let t = a[lo];
        a[lo++] = a[hi];
        a[hi--] = t;

    }
}

/**
 * * Returns the length of the run beginning at the specified position in
 * the specified array and reverses the run if it is descending (ensuring
 * that the run will always be ascending when the method returns).
 *
 * A run is the longest ascending sequence with:
 *
 *    a[lo] <= a[lo + 1] <= a[lo + 2] <= ...
 *
 * or the longest descending sequence with:
 *
 *    a[lo] >  a[lo + 1] >  a[lo + 2] >  ...
 *
 * For its intended use in a stable mergesort, the strictness of the
 * definition of "descending" is needed so that the call can safely
 * reverse a descending sequence without violating stability.
 *
 * @param {ARray} a 
 * @param {Number} lo 
 * @param {Number} hi 
 * @param {Function} c 
 * @returns {Number}
 */
function countRunAndMakeAscending (a, lo, hi, c){
    //assert lo < hi;
    let runHi = lo + 1;
    if (runHi === hi){
        return 1;
    } 

    // Find end of run, and reverse range if descending
    if (c(a[runHi++], a[lo]) < 0) { // Descending
        while(runHi < hi && c(a[runHi], a[runHi - 1]) < 0){
            runHi++;
        }
        reverseRange(a, lo, runHi);
    } else {                              // Ascending
        while (runHi < hi && c(a[runHi], a[runHi - 1]) >= 0){
            runHi++;
        } 
    }

    return runHi - lo;
}

/**
 * Sorts the specified portion of the specified array using a binary
 * insertion sort.  This is the best method for sorting small numbers
 * of elements.  It requires O(n log n) compares, but O(n^2) data
 * movement (worst case).
 *
 * If the initial part of the specified range is already sorted,
 * this method can take advantage of it: the method assumes that the
 * elements from index {@code lo}, inclusive, to {@code start},
 * exclusive are already sorted. 
 * @param {Array} a 
 * @param {Number} lo 
 * @param {Number} hi 
 * @param {Number} start 
 * @param {Function} c 
 */
 function binarySort(a, lo, hi, start, c) {
    //assert lo <= start && start <= hi;
    if (start === lo){
        start++;
    } 
    for ( ; start < hi; start++) {
        let pivot = a[start];

        // Set left (and right) to the index where a[start] (pivot) belongs
        let left = lo,
            right = start;
        // assert left <= right;
        /*
         * Invariants:
         *   pivot >= all in [lo, left).
         *   pivot <  all in [right, start).
         */
        while (left < right) {
            let mid = (left + right) >>> 1;
            if (c(pivot, a[mid]) < 0){ 
                right = mid;
            } else {
                left = mid + 1;
            }

        }

        //assert left == right;
        /*
         * The invariants still hold: pivot >= all in [lo, left) and
         * pivot < all in [left, start), so pivot belongs at left.  Note
         * that if there are elements equal to pivot, left points to the
         * first slot after them -- that's why this sort is stable.
         * Slide elements over to make room to make room for pivot.
         */
        let n = start - left;  // The number of elements to move
        // Switch is just an optimization for arraycopy in default case

        switch(n) {
            case 2:  a[left + 2] = a[left + 1];
            case 1:  a[left + 1] = a[left]; break;
            default: arrayCopy(a, left, a, left + 1, n);
        }
        a[left] = pivot;
    }
}


export class TimSort{
    constructor(arr, comparator){
        /**
        * This controls when we get *into* galloping mode.  It is initialized
        * to MIN_GALLOP.  The mergeLo and mergeHi methods nudge it higher for
        * random data, and lower for highly structured data.
        */
        this.minGallop = MIN_GALLOP;

        /**
         * A stack of pending runs yet to be merged.  Run i starts at
         * address base[i] and extends for len[i] elements.  It's always
         * true (so long as the indices are in bounds) that:
         *
         *     runBase[i] + runLen[i] == runBase[i + 1]
         *
         * so we could cut the storage for this, but it's a minor amount,
         * and keeping all the info explicit simplifies the code.
         */
        this.stackSize = 0; // Number of pending runs on stack

        this.T = arr.constructor;
        this.arr = arr;
        this.comparator = comparator;

        let len = arr.length;

        this.tmp = new this.T(len < 2 * INITIAL_TMP_STORAGE_LENGTH ? len >>> 1 : INITIAL_TMP_STORAGE_LENGTH);
        /*
         * Allocate runs-to-be-merged stack (which cannot be expanded).  The
         * stack length requirements are described in listsort.txt.  The C
         * version always uses the same stack length (85), but this was
         * measured to be too expensive when sorting "mid-sized" arrays (e.g.,
         * 100 elements) in Java.  Therefore, we use smaller (but sufficiently
         * large) stack lengths for smaller arrays.  The "magic numbers" in the
         * computation below must be changed if MIN_MERGE is decreased.  See
         * the MIN_MERGE declaration above for more information.
         */
        let stackLen = (len <    120 ? 5  :
                        len <   1542 ? 10 :
                        len < 119151 ? 19 : 40);
        this.runBase = new Int32Array(stackLen);
        this.runLen = new Int32Array(stackLen);

        this.cycles = 0;
    }

    /**
     * Sorts a part of an Array
     * @param {Array} a 
     * @param {Number} lo 
     * @param {Number} hi 
     * @param {Function} c 
     */
    static sortRange(a, lo, hi, c){
        raise(!isNumber(lo), "ArgumentTypeException: parameter lo(" + lo + ") is not a valid number.");
        raise(!isNumber(hi), "ArgumentTypeException: parameter hi(" + hi + ") is not a valid number.");
        if (typeof c !== "function") {
            insertionSort(a, lo, hi, (a, b) => a - b);
            return;
        }

        rangeCheck(a.length, lo, hi);
        let nRemaining  = hi - lo;
        if (nRemaining < 2)
            return;  // Arrays of size 0 and 1 are always sorted

        // If array is small, do a "mini-TimSort" with no merges
        if (nRemaining < MIN_MERGE) {
            let initRunLen = countRunAndMakeAscending(a, lo, hi, c);
            binarySort(a, lo, hi, lo + initRunLen, c);
            //insertionSort(a, lo, hi, c);
            return;
        }

        /**
         * March over the array once, left to right, finding natural runs,
         * extending short natural runs to minRun elements, and merging runs
         * to maintain stack invariant.
         */
        let ts = new TimSort(a, c),
            minRun = minRunLength(nRemaining);

        do {
            // Identify next run
            let runLen = countRunAndMakeAscending(a, lo, hi, c);

            // If run is short, extend to min(minRun, nRemaining)
            if (runLen < minRun) {
                let force = nRemaining <= minRun ? nRemaining : minRun;
                binarySort(a, lo, lo + force, lo + runLen, c);
                //insertionSort(a, lo, lo + force, c);
                runLen = force;
            }

            // Push run onto pending-run stack, and maybe merge
            pushRun(ts, lo, runLen);
            mergeCollapse(ts);

            // Advance to find next run
            lo += runLen;
            nRemaining -= runLen;

        } while (nRemaining != 0);

        // Merge all remaining runs to complete sort
        mergeForceCollapse(ts);
    }

    /**
     * Sorts an Array with a comparator
     * @param {ArrayLike} a 
     * @param {Function} c - a comparator function
     */
    static sort(a, c) {
        TimSort.sortRange(a, 0, a.length, c);
    }
}
