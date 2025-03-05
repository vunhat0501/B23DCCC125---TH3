import { useState, useEffect } from "react";
import { getSubjects, addSubject, editSubject, deleteSubject } from "@/services/Subject";
import { Subject } from "@/services/Subject/typings";

export default () => {
	const [subjects, setSubjects] = useState<Subject[]>([]);

	// Load subjects from localStorage
	useEffect(() => {	
		setSubjects(getSubjects());
	}
	, []);

	// addSubject
	const handleAddSubject = (subjectId: string, name: string, credits: number, knowledgeBlocks: string[]) => {
		const newSubject: Subject = {
			id: Date.now().toString(),
			subjectId,
			name,
			credits,
			knowledgeBlocks: knowledgeBlocks.map((name, index) => ({
				id: `${Date.now()}-${index}`,
				name,
			})),
		};
		setSubjects(addSubject(newSubject));
	}

	// editSubject
	const handleEditSubject = (id: string, updatedSubject: Partial<Subject>) => {
		setSubjects(editSubject(id, updatedSubject));
	}

	// deleteSubject
	const handleDeleteSubject = (id: string) => {	
		setSubjects(deleteSubject(id));
	}

	return {
		subjects,
		handleAddSubject,
		handleEditSubject,
		handleDeleteSubject,
	};
};