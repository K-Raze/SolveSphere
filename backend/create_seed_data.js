const fs = require('fs');

const algorithms = [
    "find the maximum sum of a contiguous subarray in an array of integers. Time limit O(N).",
    "find the longest substring without repeating characters. Space complexity should be O(min(N, M)).",
    "merge two sorted linked lists into a single sorted linked list in O(N) time.",
    "check if a given string is a valid palindrome, considering only alphanumeric characters and ignoring cases.",
    "find the maximum depth of a binary tree.",
    "invert a binary tree.",
    "detect if a linked list has a cycle.",
    "given a string of parentheses, determine if the input string is valid (properly closed).",
    "find the missing number in an array containing n distinct numbers taken from 0, 1, 2, ..., n.",
    "find the minimum number of coins that make up a given amount.",
    "given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    "find all unique triplets in the array which gives the sum of zero.",
    "search for a target value in a rotated sorted array. Time complexity must be O(log N).",
    "find the kth largest element in an unsorted array.",
    "serialize and deserialize a binary tree.",
    "find the lowest common ancestor of two nodes in a binary search tree.",
    "implement a LRU cache.",
    "merge overlapping intervals in an array.",
    "given a matrix, sort each diagonal in ascending order.",
    "find the number of islands (connected 1s) in a 2D grid.",
    "clone a graph represented as an adjacency list.",
    "find the shortest path in an unweighted graph from source to destination.",
    "determine if a directed graph has a cycle (course schedule problem).",
    "find the longest increasing subsequence in an array.",
    "calculate the edit distance between two strings.",
    "find the total number of unique paths from top-left to bottom-right of a grid with obstacles.",
    "decode a string encoded with run-length encoding logic.",
    "design a data structure that supports insert, delete, and getRandom in O(1) time.",
    "find the product of array except self without using division.",
    "given an array of heights representing a histogram, find the area of the largest rectangle.",
    "trap rain water given an array of elevation maps.",
    "find the sliding window maximum of size K in an array.",
    "implement a Trie (prefix tree).",
    "find all words on a Boggle board (word search II).",
    "find the median of two sorted arrays in O(log(m+n)) time.",
    "regular expression matching with support for '.' and '*'.",
    "find the minimum window substring containing all characters of another string.",
    "reverse nodes in a linked list in groups of k.",
    "solve a Sudoku puzzle by filling the empty cells.",
    "generate all combinations of n pairs of well-formed parentheses.",
    "convert an integer to a Roman numeral.",
    "find the longest palindromic substring.",
    "find the zigzag level order traversal of a binary tree.",
    "flatten a binary tree to a linked list.",
    "construct a binary tree from preorder and inorder traversal.",
    "find the next permutation of an array of numbers.",
    "find the first missing positive integer.",
    "rotate an image (2D matrix) by 90 degrees in-place.",
    "group anagrams from a list of strings.",
    "calculate x raised to the power n in O(log N) time."
];

const companies = ["Google", "Meta", "Amazon", "Netflix", "Apple", "Microsoft", "Uber", "Lyft", "Airbnb", "Stripe"];
const rounds = ["phone-screen", "onsite", "online-assessment"];
const roles = ["Software Engineer", "Backend Engineer", "Frontend Engineer", "Fullstack Engineer", "SRE"];

const seedData = algorithms.map((algo, index) => {
    const company = companies[index % companies.length];
    const round = rounds[index % rounds.length];
    const role = roles[index % roles.length];
    const year = 2024;
    
    return {
        company,
        role,
        interviewRound: round,
        yearAsked: year,
        rawDescription: `I recently interviewed at ${company} for a ${role} position. During the ${round}, the interviewer asked me to ${algo} The input size could be up to 10^5, so an efficient solution was required. I wrote the code in Python and the interviewer was satisfied.`
    };
});

fs.writeFileSync('seed_data.json', JSON.stringify(seedData, null, 2));
console.log(`✅ Generated seed_data.json with ${seedData.length} problems`);
