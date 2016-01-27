H5P.GoToQuestion = (function ($, EventDispatcher, UI) {

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

    // Clone parameters so that the parameters doesn't get the default values
    parameters = $.extend(true, {}, parameters);

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
    var $chosenText;
    var $continueMsg;
    var $continueButton;
    var choices = [];

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
      $choices = $('<ul/>', {
        'class': GoToQuestion.htmlClass + '-choices',
        appendTo: $wrapper
      });

      // Append choices to wrapper
      for (var i = 0; i < parameters.choices.length; i++) {
        createChoice(parameters.choices[i]);
      }
    };

    /**
     * Create HTML for choice.
     *
     * @private
     * @param {object} choiceParams
     * @param {string} choiceParams.text
     * @param {int} choiceParams.goTo
     * @param {string} choiceParams.ifChosenText
     */
    var createChoice = function (choiceParams) {
      // Wrapper and list element
      var $li = $('<li/>', {
        'class': GoToQuestion.htmlClass + '-choice',
        appendTo: $choices
      });

      // The button for choosing
      $('<div/>', {
        'class': GoToQuestion.htmlClass + '-button',
        tabIndex: 0,
        role: 'button',
        'aria-disabled': false,
        html: choiceParams.text,
        on: {
          click: function () {
            choose.call(this, choiceParams);
          },
          keypress: function (event) {
            if (event.which === 32) {
              // Space bar pressed
              choose.call(this, choiceParams);
            }
          }
        },
        appendTo: $li
      });
    };

    /**
     * Choice chosen.
     *
     * @private
     * @param {object} choiceParams
     * @param {string} choiceParams.text
     * @param {int} choiceParams.goTo
     * @param {string} choiceParams.ifChosenText
     */
    var choose = function (choiceParams) {
      var $button = $(this);
      if ($button.attr('aria-disabled') === 'true') {
        return; // Prevent choosing another option while animation is running
      }

      // Disable all buttons
      var $buttons = $choices.find('.' + GoToQuestion.htmlClass + '-button')
          .attr('aria-disabled', true);

      // Use parent LI as placeholder
      var $li = $button.parent();
      $li.css('height', $li[0].getBoundingClientRect().height);

      // Mark button as chosen and animate
      var buttonStyle = window.getComputedStyle($button[0]);
      var borderWidth = parseFloat(buttonStyle.borderTopWidth);
      $button.addClass(GoToQuestion.htmlClass + '-chosen').css('top', $button[0].offsetTop + borderWidth);

      /**
       * Resets the choices UI
       * @private
       */
      var resetChoices = function () {
        $li.css('height', '');
        $button.removeClass(GoToQuestion.htmlClass + '-chosen').css('top', '');
        $buttons.attr('aria-disabled', false);
      };

      // Animate the choice if we're going to have continue screen
      if (choiceParams.ifChosenText) {
        setTimeout(function () {
          // Start animation
          buttonStyle = window.getComputedStyle($button[0]);
          $button.css('top', $text[0].getBoundingClientRect().height - parseFloat(buttonStyle.paddingTop));
        }, 0);

        // Give some time for the animation to play before we continue
        setTimeout(function () {
          // Show message and continue button before proceeding
          continueScreen(choiceParams.text, choiceParams.ifChosenText, choiceParams.goTo);
          setTimeout(resetChoices, 0);
        }, 1000);
      }
      else {
        // No animation, but let the choices stay for a while
        setTimeout(function () {
          // Done
          self.trigger('chosen', choiceParams.goTo);
          setTimeout(resetChoices, 0);
        }, 500);
      }
    };

    /**
     * Displays the continue message and button.
     *
     * @private
     * @param {string} text
     * @param {number} goTo
     */
    var continueScreen = function (chosenText, continueMsg, goTo) {
      if ($continueMsg === undefined) {
        // Add chosen option text
        $chosenText = $('<div/>', {
          'class': GoToQuestion.htmlClass + '-chosentext',
          html: chosenText
        });

        // Create continune message
        $continueMsg = $('<div/>', {
          'class': GoToQuestion.htmlClass + '-continuemsg',
          html: continueMsg
        });

        // Create continue button
        $continueButton = UI.createButton({
          'class': GoToQuestion.htmlClass + '-continue',
          html: parameters.continueButtonLabel,
          title: parameters.continueButtonLabel,
          on: {
            click: createContinueHandler(goTo)
          }
        });
      }
      else {
        // Update existing continue elements
        $chosenText.html(chosenText);
        $continueMsg.html(continueMsg);
        $continueButton.on('click', createContinueHandler(goTo));
      }

      // Remove choices
      $choices.detach();

      // Add continue text and button
      $chosenText.add($continueMsg).add($continueButton).appendTo($wrapper);

      // Makes it easy to re-style the task in this state
      $wrapper.addClass(GoToQuestion.htmlClass + '-continuestate');
    };

    /**
     * Factory function for generating continue button handlers
     *
     * @private
     * @param {number} goTo
     */
    var createContinueHandler = function (goTo) {
      return function () {
        self.trigger('chosen', goTo);
        // Use timeout to avoid flickering
        setTimeout(function () {
          $chosenText.add($continueMsg).add($continueButton.off('click')).detach();
          $choices.appendTo($wrapper);
          $wrapper.removeClass(GoToQuestion.htmlClass + '-continuestate');
        }, 1);
      };
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
})(H5P.jQuery, H5P.EventDispatcher, H5P.JoubelUI);
