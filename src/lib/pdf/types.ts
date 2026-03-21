export interface PdfGenerationInput {
  readonly characterVersionId: string;
  readonly childName: string;
  readonly storySlug: string;
}

export interface BookPageData {
  readonly page: number;
  readonly sceneImageUrl: string;
  readonly textPageImageKey: string;
  readonly text: string;
  readonly templateId: string;
}
