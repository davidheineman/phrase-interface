## Phrase-level Simplification Annotator
Allows annotating text-to-text sentence diffs. by paraphrase. `index.html` can be used both as a standalone annotator or dropped directly into mTurk.

**See a [demo of the interface](https://davidheineman.github.io/phrase-interface/)**

### How to use
Identify the edits between the sentences (ex. by using a [phrase alignment tool](https://github.com/chaojiang06/neural-Jacana)) and replace `data/input.json` (see below).

#### Format of `input.json`
Each sentence just requires an ID, input and output sentence, and the indices of each edit in the corresponsing input/output sentence. See `data/example_input.json` for an example.

```
[
  {
    "ID": sentence ID,
    "Original": original sentence,
    "Simplification": simplified sentence,
    "Alignment": [
        [
            [start index on original sentence, end index on original sentence], 
            [start index on simplified sentence, end index on simplified sentence]
        ], [
            indices of edit 2
        ], 
        ...
    ]
  },
  {
    sentence 2
  },
  ...
]
```

#### Output Format
The output has the same JSON format, except it has an additional `Annotations` field which contains dictionaries for each phrase in the sentence in the following format:

**Note:** The scores will be either `1`, `0` or `null`, depending on whether that annotation asked that specific question. 
```
...
"Annotations": [
    {
        "Original": original phrase,
        "Simplification": simplified phrase,
        "Alignment": [
            [start index on original sentence, end index on original sentence], 
            [start index on simplified sentence, end index on simplified sentence]
        ],
        "Scores": [
            Yes/No answer for question 1,
            Yes/No answer for question 2,
            ...
            Yes/No answer for question 8
        ]
    },
    {
        phrase edit 2
    },
    ...
]
...
```

<!-- Also - Here's an unused, and potentially alternative design (borrowed heavily from [SCARECROW](https://yao-dou.github.io/scarecrow/)). We decided against it because it would require extra explanation:

![New interface](new-interface-design.png) -->