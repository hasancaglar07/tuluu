import Container from "./container";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="border-b bg-muted/40 py-10">
      <Container className="">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-3xl text-muted-foreground">{description}</p>
        )}
      </Container>
    </div>
  );
}
