# Classify events
Use an event title plus description to classify events.

## Basic Setup
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

## Adanced Configuration
The following applies to your `config/config.json` file
1. Classifier word categories must be formatted as category_identifier_words
2. This first part of the classifier word category (eg: `confirmed_first_words` first part is `confirmed`) identifies which bucket the selected item will be added to if one of the terms from the list is found. For instance, if 'candidate' from 'confirmed_words' is found, the item will be immediately added to the `confirmed` bucket
2. `searchOrder` is an array that indicates what order the search lists will be applied in. Whichever term is found first will determine (as per *2.* above) which bucket the item ends up in.

## Training data
Training data will be used by the Bayes classifier to create a model of events which should be confirmed or deleted. The first row of the csv should contain field headers that match the field headers in the config file for title and description.
* `train/confirmed.csv` should contain event rows with descriptions of events to be confirmed. First row of the csv should contain field header labels.
* `train/deleted.csv` should contain event rows with descriptions of events that should be deleted
* Training files should be in CSV format. 
* The first row of the csv file should contain header fields.

## Probablistic search
After all configured searches run, a probabilistic classification is done based on a bayesian classifier. This should at least be more than 50% accurracy but I'm not entirely sure how effective it is.

## Stop words
The `config/` directory includes lists of stop words - proper names. These are removed from the items before being weighted probabilistically. You can add or remove words from these lists.

