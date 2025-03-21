import { Card, CardContent } from "@/components/ui/card";

interface ApplicationAdviceBoxProps {
  advice: string;
}

const ApplicationAdviceBox = ({ advice }: ApplicationAdviceBoxProps) => {
  return (
    <Card className="rounded-lg bg-blue-50 p-0 border-l-4 border-blue-500 mt-4">
      <CardContent className="p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="material-icons text-blue-500">tips_and_updates</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Application Advice</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>{advice}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationAdviceBox;
