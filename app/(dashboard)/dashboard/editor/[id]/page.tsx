import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResumeContent } from "@/types/resume";
import { ResumeEditor } from "./_components/resume-editor";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) redirect("/login");

  const resume = await prisma.resume.findUnique({
    where: { 
      id: id,
      userId: session.user.id 
    },
  });

  if (!resume) {
    notFound();
  }

  // Cast seguro do JSON para nosso tipo TS
  const initialContent = resume.content as unknown as ResumeContent;

  return (
    <div className="h-[calc(100vh-80px)]">
      <ResumeEditor 
        resumeId={resume.id} 
        initialData={initialContent} 
        resumeTitle={resume.title}
      />
    </div>
  );
}