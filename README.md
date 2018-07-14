# TimSort
TimSort implementation in JS/ES.
made for Education purposes.

# What is TimSort
[TimSort](https://en.wikipedia.org/wiki/Timsort) is a [hybrid](https://en.wikipedia.org/wiki/Hybrid_algorithm) [stable](https://en.wikipedia.org/wiki/Category:Stable_sorts) [sorting algorithm](https://en.wikipedia.org/wiki/Sorting_algorithm), derived from [merge sort](https://en.wikipedia.org/wiki/Merge_sort) and [insertion sort](https://en.wikipedia.org/wiki/Insertion_sort), designed to perform well on many kinds of real-world data. It uses techniques from Peter McIlroy's "Optimistic Sorting and Information Theoretic Complexity", in Proceedings of the Fourth Annual ACM-SIAM Symposium on Discrete Algorithms, pp. 467–474, January 1993. It was implemented by Tim Peters in 2002 for use in the [Python programming language](https://en.wikipedia.org/wiki/Python_(programming_language)). The algorithm finds subsequences of the data that are already ordered, and uses that knowledge to sort the remainder more efficiently. This is done by merging an identified subsequence, called a run, with existing runs until certain criteria are fulfilled. Timsort has been Python's standard sorting algorithm since version 2.3. It is also used to sort arrays of non-primitive type in [Java SE 7](https://en.wikipedia.org/wiki/Java_7), on the [Android platform](https://en.wikipedia.org/wiki/Android_(operating_system)), and in [GNU Octave.](https://en.wikipedia.org/wiki/GNU_Octave)

# Other Details
The source code in JS was based from Google's TimSort implementation that can be seen [here](http://cr.openjdk.java.net/~martin/webrevs/openjdk7/timsort/raw_files/new/src/share/classes/java/util/TimSort.java).
The description of TimSort can be found [here](http://svn.python.org/projects/python/trunk/Objects/listsort.txt).
