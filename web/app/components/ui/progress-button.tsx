import { useMachine } from "@xstate/react";
import { Check } from "lucide-react";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { progressButtonMachine } from "~/machines/button-machine";

type ProgressButtonBaseProps = {
  buttonLabel: string;
  successColorClass?: string;
  onClick?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  prefixIcon?: React.ReactNode;
  className?: string;
};

type ManualProgressButtonProps = ProgressButtonBaseProps & {
  progressType?: "manual";
  progress: number;
  duration?: never;
  totalDuration?: never;
  numberOfProgressSteps?: never;
};

type AutomaticProgressButtonProps = ProgressButtonBaseProps & {
  progressType?: "automatic";
  progress?: never;
  totalDuration?: number;
  numberOfProgressSteps?: number;
};

type ProgressButtonProps =
  | ManualProgressButtonProps
  | AutomaticProgressButtonProps;

const ProgressButton = (props: ProgressButtonProps) => {
  const {
    className,
    progressType = "automatic",
    totalDuration = 5000,
    numberOfProgressSteps = 5,
    successColorClass,
    onClick,
    onComplete,
    onError,
    progress,
    prefixIcon,
  } = props;

  const [state, send] = useMachine(progressButtonMachine);

  useEffect(() => {
    if (progress) {
      send({ type: "setProgress", progress });
      if (progress >= 100) {
        setTimeout(() => {
          try {
            send({ type: "setProgress", progress: 0 });
            send({ type: "complete" });
            handleComplete();
          } catch (e: any) {
            handleError(e);
          }
        }, 1000);
      }
    }
  }, [progress, send]);

  const scheduleProgressUpdates = (totalDuration: number, steps: number) => {
    // Generate random durations
    const randomDurations = Array.from({ length: steps }, () => Math.random());
    const totalRandom = randomDurations.reduce((sum, value) => sum + value, 0);
    const normalizedDurations = randomDurations.map(
      (value) => (value / totalRandom) * totalDuration
    );

    // Generate random progress increments
    const randomProgressIncrements = Array.from({ length: steps }, () =>
      Math.random()
    );
    const totalRandomProgress = randomProgressIncrements.reduce(
      (sum, value) => sum + value,
      0
    );
    const normalizedProgresses = randomProgressIncrements.map((value) =>
      Math.round((value / totalRandomProgress) * 100)
    );

    let accumulatedTime = 0;
    let accumulatedProgress = 0;

    for (let i = 0; i < steps; i++) {
      accumulatedTime += normalizedDurations[i];
      accumulatedProgress += normalizedProgresses[i];

      let progress = accumulatedProgress > 95 ? 100 : accumulatedProgress;

      setTimeout(() => {
        send({ type: "setProgress", progress });

        if (progress === 100) {
          setTimeout(() => {
            try {
              send({ type: "setProgress", progress: 0 });
              send({ type: "complete" });
              handleComplete();
            } catch (e: any) {
              handleError(e);
            }
          }, 1000);
        }
      }, accumulatedTime);
    }
  };

  const isManualComplete = () =>
    progressType === "manual" && state.context.progress >= 100;
  const shouldStartAutomaticProgress = () =>
    progressType === "automatic" && state.matches("inProgress");

  useEffect(() => {
    if (isManualComplete()) {
      handleComplete();
    } else if (shouldStartAutomaticProgress()) {
      scheduleProgressUpdates(totalDuration, numberOfProgressSteps);
    }
  }, [progressType, state.value, totalDuration, numberOfProgressSteps]);

  const handleClick = () => {
    send({ type: "click" });
    onClick?.();
  };

  const handleComplete = () => {
    send({ type: "complete" });
    onComplete?.();
  };

  const handleError = (error: Error) => {
    onError?.(error);
  };
  const buttonLabel = (
    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{props.buttonLabel}</span>
  );
  const progressBar = (
    <Progress value={state.context.progress} className="w-[60px] h-[10px]" />
  );
  const successIcon = <Check className="h-5 w-5" />;

  const bgColor = `[&>*>*]:bg-${successColorClass}`;

  const bgColorClass = () => {
    if (!successColorClass || state.context.progress < 100)
      return "[&>*>*]:bg-primary-900";
    if (state.context.progress >= 100) {
      return bgColor;
    }
  };

  return (
    <Button
      size="sm"
      variant="default"
      className={` ${className} ${!state.matches("idle") ? "pointer-events-none" : ""
        }`}
      onClick={handleClick}
    >
      {state.matches("idle") && (
        <span className="flex gap-1 items-center animate-in fade-in zoom-in spin-in">
          {prefixIcon && <span className="transition-all duration-200 group-hover:-rotate-12">
            {prefixIcon}
          </span>}
          {buttonLabel}
        </span>
      )}
      {state.matches("inProgress") && (
        <span
          className={`transition-color animate-in fade-in zoom-in absolute`}
        >
          <span className={bgColorClass()}>{progressBar}</span>
        </span>
      )}
      {state.matches("success") && (
        <span className="animate-in fade-in zoom-in spin-in">
          {successIcon}
        </span>
      )}
      {state.matches("successFadeOut") && (
        <span className="animate-out fade-out zoom-out">{successIcon}</span>
      )}
    </Button>

  );
};

export default ProgressButton;