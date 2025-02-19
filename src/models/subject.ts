import { useEffect, useState } from 'react';
import { getSubjects, saveSubjects } from '@/services/Subject';

export default () => {
	const [subjects, setSubjects] = useState<Subject.SubjectItem[]>([]);

	// Load subjects from localStorage on component mount
	useEffect(() => {
		setSubjects(getSubjects());
	}, []);

	// Save subjects to localStorage whenever the subjects state changes
	useEffect(() => {
		saveSubjects(subjects);
	}, [subjects]);

	// Add a new subject
	const addSubject = (
		subject: string,
		start_time: string,
		end_time: string,
		day: string,
		content: string,
		note: string,
	) => {
		const newSubject: Subject.SubjectItem = {
			id: Date.now().toString(),
			subject,
			start_time,
			end_time,
			day,
			content,
			note,
		};
		setSubjects((prevSubjects) => [...prevSubjects, newSubject]);
	};

	// Edit an existing subject
	const editSubject = (id: string, updatedSubject: Partial<Subject.SubjectItem>) => {
		setSubjects((prevSubjects) =>
			prevSubjects.map((subject) => (subject.id === id ? { ...subject, ...updatedSubject } : subject)),
		);
	};

	// Delete a subject
	const deleteSubject = (id: string) => {
		setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject.id !== id));
	};

	return {
		subjects,
		addSubject,
		editSubject,
		deleteSubject,
	};
};
