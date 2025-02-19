// Get subjects from localStorage
export const getSubjects = (): Subject.SubjectItem[] => {
	const subjects = localStorage.getItem('subjects');
	return subjects ? JSON.parse(subjects) : [];
};

// Save subjects to localStorage
export const saveSubjects = (subjects: Subject.SubjectItem[]) => {
	localStorage.setItem('subjects', JSON.stringify(subjects));
};
