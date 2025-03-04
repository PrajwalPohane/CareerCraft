export const getTestQuestions = (jobPosition) => {
  // This could be fetched from an API based on job position
  return [
    {
      id: 1,
      question: "What does HTML stand for?",
      options: [
        { id: 'a', text: "Hyper Text Markup Language" },
        { id: 'b', text: "High Tech Modern Language" },
        { id: 'c', text: "Hyper Transfer Markup Language" },
        { id: 'd', text: "Home Tool Markup Language" }
      ],
      correctAnswer: 'a'
    },
    {
      id: 2,
      question: "Which of the following is a JavaScript framework?",
      options: [
        { id: 'a', text: "Django" },
        { id: 'b', text: "Flask" },
        { id: 'c', text: "React" },
        { id: 'd', text: "Laravel" }
      ],
      correctAnswer: 'c'
    },
    // Add more questions as needed
  ];
}; 