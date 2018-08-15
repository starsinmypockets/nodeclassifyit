# Classify events
Use an event title plus description to classify events using a naive Bayes classifier.

## Briefly about
This uses a (naive bayes algorithm)[https://en.wikipedia.org/wiki/Naive_Bayes_classifier] classifier to determine whether events should be confirmed or deleted.

## Training data
Training data will be used by the Bayes classifier to create a model of events which should be confirmed or deleted. The first row of the csv should contain field headers that match the field headers in the config file for title and description.
* `train/confirmed.csv` should contain event rows with descriptions of events to be confirmed. First row of the csv should contain field header labels.
* `train/deleted.csv` should contain event rows with descriptions of events that should be deleted
* Training files should be in CSV format. 
* The first row of the csv file should contain header fields.

## configuration
* `cp example_config.js config.js` Copy example config
* `config.js` should contain the names of the fields to be used for comparison (the field with the description in it):
```javascript
module.exports = 
{
    confirmedTrainField: 'field9',
    deletedTrainField: 'field18',
    inputDataField: 'description'
}
```

## installation
Make sure node js is installed https://nodejs.org/en/download/

## Running the classifier
* `node classify.js /path/to/input.csv /output/dir/`
* two files will be generated:
* * `/output/dir/confirmed.csv`
* * `/output/dir/deleted.csv`


