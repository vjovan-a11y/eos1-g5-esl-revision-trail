/* 54-g5-glue.js - Grade 5: Zip's first line for each Grade 5 tool ("what to do", at most 10 words, with VI).
   A tool file adds its lines to T.G5_DO (it loads before 52-kit-model.js); here they join the lines of the model kit,
   which reads DO[task.ui.k] when a question opens. */
(function (T) {
  'use strict';
  const DO = T.zipLines && T.zipLines.model && T.zipLines.model.doLines;
  if (DO) Object.assign(DO, T.G5_DO || {});
})(window.T = window.T || {});

