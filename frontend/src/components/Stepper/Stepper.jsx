import "./Stepper.css";

const Stepper = ({ steps }) => {
  return (
    <div className="stepper w-full">
      {steps.map(({ label }, index) => {
        return (
          <div className="stepper-container w-full">
            <div className="step-number">
              {index + 1}
              <div className="step-line"></div>
            </div>
            <div className="step-label">{steps[index]}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
