/* =========================================================
   storybook.js — Storybook timeline + Knowledge Journey dashboard
   Demonstrates cumulative daily knowledge building.
   ========================================================= */
(function (global) {
  'use strict';

  // Curated daily resources that build one evolving story about "Learning".
  const DAYS = [
    {
      day: 'Day 01', date: 'Aug 08', title: 'How Memory Works',
      summary: 'Encoding, storage and retrieval form the backbone of every memory system.',
      topics: ['Memory', 'Cognition'],
      text: `How Memory Works
Memory has three stages. Encoding transforms sensory input into a storable form. Storage keeps information across short-term and long-term stores. Retrieval brings memories back when we need them. Deep encoding creates stronger memories than shallow repetition.`
    },
    {
      day: 'Day 02', date: 'Aug 10', title: 'Spaced Repetition',
      summary: 'Reviewing material at increasing intervals dramatically improves long-term retention.',
      topics: ['Memory', 'Study Methods'],
      text: `Spaced Repetition
Spaced repetition schedules reviews at increasing intervals to fight forgetting. It strengthens retrieval and moves knowledge into long-term memory. Flashcard systems automate the schedule. Testing yourself is more effective than re-reading.`
    },
    {
      day: 'Day 03', date: 'Aug 12', title: 'Focus & Attention',
      summary: 'Deep focus is a trainable skill that multiplies the value of study time.',
      topics: ['Focus', 'Productivity', 'Cognition'],
      text: `Focus and Attention
Attention is the gateway to learning. Deep work means long uninterrupted focus on a demanding task. Distraction fragments attention and weakens encoding. Techniques like time-blocking and the Pomodoro method protect focus.`
    },
    {
      day: 'Day 04', date: 'Aug 14', title: 'Sleep & Consolidation',
      summary: 'Sleep is when the brain consolidates the day\'s learning into durable memory.',
      topics: ['Sleep', 'Memory', 'Health'],
      text: `Sleep and Consolidation
During sleep the brain consolidates the day's experiences into long-term memory. Deep sleep strengthens facts while REM sleep supports creativity and connections. Poor sleep sabotages focus and encoding the next day.`
    },
    {
      day: 'Today', date: 'Aug 15', title: 'Building a Learning System',
      summary: 'Combining focus, spacing, sleep and review into one daily practice.',
      topics: ['Study Methods', 'Productivity', 'Focus'],
      text: `Building a Learning System
A learning system combines focus, spaced repetition and good sleep into a daily habit. Review yesterday, learn something new, and connect it to what you already know. Consistency compounds over weeks into deep expertise.`
    }
  ];

  global.Storybook = { DAYS };

})(typeof window !== 'undefined' ? window : this);
