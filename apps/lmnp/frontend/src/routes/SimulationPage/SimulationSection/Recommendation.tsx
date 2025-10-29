type RecommendationProps = {
  recommendedRegime: string;
  recommendation: string;
};

function Recommendation({
  recommendedRegime,
  recommendation,
}: RecommendationProps) {
  return (
    <div className="mb-6 p-4 bg-primary/10 rounded-lg">
      <p className="text-lg font-semibold text-primary mb-2">
        Recommandation : {recommendedRegime}
      </p>
      <p className="text-muted-foreground">{recommendation}</p>
    </div>
  );
}

export { Recommendation };
