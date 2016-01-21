(function ($, GoToQuestion, EventDispatcher) {

  /**
   * Collage Clip
   *
   * @class H5P.Collage.Clip
   * @extends H5P.EventDispatcher
   * @param {H5P.jQuery} $container
   * @param {Object} content
   * @param {number} contentId
   */
  GoToQuestion.Choice = function (text, goTo, ifChosenText) {
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    // Private class variables
    var $wrapper;

    /**
     *
     */
    var choose = function () {
      self.trigger('chosen', {
        goTo: goTo,
        ifChosenText: ifChosenText
      });
    };

    /**
     * Appends the choice to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.appendTo = function ($container) {
      if ($wrapper === undefined) {
        // Create HTML for choice
        $wrapper = $('<li/>', {
          'class': GoToQuestion.htmlClass + '-choice'
        });

        // The button for choosing
        $('<div/>', {
          'class': GoToQuestion.htmlClass + '-button',
          tabIndex: 0,
          role: 'button',
          html: text,
          on: {
            click: choose,
            keypress: function (event) {
              if (event.which === 32) {
                // Space bar pressed
                choose();
              }
            }
          },
          appendTo: $wrapper
        });
      }

      $wrapper.appendTo($container);
    };
  };

  // Extends the event dispatcher
  GoToQuestion.Choice.prototype = Object.create(EventDispatcher.prototype);
  GoToQuestion.Choice.prototype.constructor = GoToQuestion.Choice;

})(H5P.jQuery, H5P.GoToQuestion, H5P.EventDispatcher);
