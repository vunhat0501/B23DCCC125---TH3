import { Subject } from "./typings";

export const getSubjects = (): Subject[] => {
	const data = localStorage.getItem("subjects");
	return data ? JSON.parse(data) : [];
};

export const saveSubjects = (subjects: Subject[]) => {
	localStorage.setItem("subjects", JSON.stringify(subjects));
}

export const addSubject = (subject: Subject): Subject[] => {
	const subjects = getSubjects();
	const updatedSubjects = [...subjects, subject];
	saveSubjects(updatedSubjects);
	return updatedSubjects;
};

export const editSubject = (id: string, updatedSubject: Partial<Subject>): Subject[] => {
	const subjects = getSubjects().map((subject) => (subject.id === id ? { ...subject, ...updatedSubject } : subject));
	saveSubjects(subjects);
	return subjects;
};

export const deleteSubject = (id: string): Subject[] => {
	const subjects = getSubjects().filter((subject) => subject.id !== id);
	saveSubjects(subjects);
	return subjects;
};