export interface KnowledgeBlock {
	id: string;
	name: string;
}

export interface Subject {
	id: string;
	subjectId: string;
	name: string;
	credits: number;
	knowledgeBlocks: KnowledgeBlock[];
}