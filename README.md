# Classify events
Use an event title plus description to classify events.

## Setup
* Make sure node js is installed https://nodejs.org/en/download/
* clone this directory
* run `npm install`
* open `config/config.json`
* make sure that `inputPath` is the path to your csv data
* make sure that `outputPath` is an existing directory
* make sure that `inputTiteField` matches title field for event
* make sure that `inputDataField` matches event description field
* test system with `npm run test`

## Run!
* do setup, above
* from project root do `node index.js`
* should output `output/confirmed.csv` and `output/deleted.csv` (default, or to your configured output path)

## Sort algorithm
The classifier does this:
1. Classify as `delete` anything with words from `config -> delete_words`
2. Classify as `confirm` anything with words from `config -> confirmed_words`
3. Use the bayesian classifier trained on our `train/` dataset to classify remaining events based on word-count 

## Training data
Training data will be used by the Bayes classifier to create a model of events which should be confirmed or deleted. The first row of the csv should contain field headers that match the field headers in the config file for title and description.
* `train/confirmed.csv` should contain event rows with descriptions of events to be confirmed. First row of the csv should contain field header labels.
* `train/deleted.csv` should contain event rows with descriptions of events that should be deleted
* Training files should be in CSV format. 
* The first row of the csv file should contain header fields.
