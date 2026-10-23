import { ArrowRight } from "lucide-react";
import DocPreviewCard from "./DocPreviewCard";

export default function DocumentCompare() {
  return (
    <div className="compare">
      <DocPreviewCard lang="fr" />
      <div className="compare__arrow-wrap">
        <div className="compare__arrow">
          <ArrowRight size={16} color="white" />
        </div>
      </div>
      <DocPreviewCard lang="en" />
    </div>
  );
}