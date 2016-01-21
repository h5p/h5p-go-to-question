H5P.GoToQuestion = (function ($, EventDispatcher) {

  /**
   * Create a new Go To Question!
   *
   * @class H5P.GoToQuestion
   * @extends H5P.EventDispatcher
   * @param {Object} parameters
   */
  function GoToQuestion(parameters) {
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    // Content defaults
    setDefaults(parameters, {
      text: 'Choose your side',
      choices: [
        {
          text: "Dark side",
          goTo: 1,
        },
        {
          text: "Light side",
          goTo: 0,
        }
      ],
      continueButtonLabel: 'Continue'
    });

    // Private class variables
    var $wrapper;
    var $text;
    var $choices;
    var choices = [];

    // Instantiate our choices
    for (var i = 0; i < parameters.choices.length; i++) {
      var choice = parameters.choices[i];

      try {
        // Try to create new choice
        choice = new GoToQuestion.Choice(choice.text, choice.goTo, choice.ifChosenText);
        choices.push(choice);
      }
      catch (err) {
        // Skipping invalid choices
      }

      if (choice instanceof GoToQuestion.Choice) {
        // If successful, listen for chosen events
        choice.on('chosen', function (event) {
          console.log(event.data);
          if (event.data.ifChosenText) {
            // TODO: Show continue button before continuing
          }
          self.trigger('chosen', event.data.goTo);
        });
      }
    }

    /**
     * Creates the basic HTML elements that are needed to begin with.
     *
     * @private
     */
    var createHtml = function () {
      // Create question wrapper
      $wrapper = $('<div/>', {
        'class': GoToQuestion.htmlClass + '-wrapper'
      });

      // Create and append question text
      $text = $('<div/>', {
        'class': GoToQuestion.htmlClass + '-text',
        html: parameters.text,
        appendTo: $wrapper
      });

      // Create and append choices wrapper
      $text = $('<ul/>', {
        'class': GoToQuestion.htmlClass + '-choices',
        appendTo: $wrapper
      });

      // Append choices to wrapper
      for (var i = 0; i < choices.length; i++) {
        choices[i].appendTo($wrapper);
      }
    };

    /**
     * Attach the question to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function ($container) {
      if ($wrapper === undefined) {
        // Only create the HTML on the first attach
        createHtml();
      }

      // Add to DOM
      $container.addClass(GoToQuestion.htmlClass).html('').append($wrapper);
    };
  }

  // Extends the event dispatcher
  GoToQuestion.prototype = Object.create(EventDispatcher.prototype);
  GoToQuestion.prototype.constructor = GoToQuestion;

  // Set static html class base
  GoToQuestion.htmlClass = 'h5p-gotoquestion';

  /**
   * Simple recusive function the helps set default values without
   * destroying object references.
   *
   * @param {object} params values
   * @param {object} values default values
   */
  var setDefaults = function (params, values) {
    for (var prop in values) {
      if (values.hasOwnProperty(prop)) {
        if (params[prop] === undefined) {
          params[prop] = values[prop];
        }
        else if (params[prop] instanceof Object && !(params[prop] instanceof Array)) {
          setDefaults(params[prop], values[prop]);
        }
      }
    }
  };

  return GoToQuestion;
})(H5P.jQuery, H5P.EventDispatcher);
