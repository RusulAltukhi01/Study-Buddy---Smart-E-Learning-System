import "./Calender.css";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const Calender = ({ events, height }) => {
  const handleEventClick = (clickInfo) => {
    console.log("Event clicked:", clickInfo.event);

  };

  const renderEventContent = (eventInfo) => {
    const task = eventInfo.event;
    const isCompleted = task.backgroundColor === "#10b981";
    const viewType = eventInfo.view.type; 

    if (viewType === "dayGridMonth") {

      return (
        <div className={`custom-event ${isCompleted ? "completed" : ""}`}>
          <div className="event-time">
            {task.start?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="event-title">{task.title}</div>
        </div>
      );
    } else {

      return (
        <div className={`timeline-event ${isCompleted ? "completed" : ""}`}>
          <div className="timeline-event-title">{task.title}</div>
          {task.extendedProps?.description && (
            <div className="timeline-event-description">
              {task.extendedProps.description}
            </div>
          )}
          <div className="timeline-event-time">
            {task.start?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {task.end && (
              <>
                {" "}
                -{" "}
                {task.end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="calendar-wrapper">
      <Fullcalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={"dayGridMonth"}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}
        height={height}
        contentHeight="100%"
        aspectRatio={1.8}
        events={events}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={3}
        dayMaxEventRows={3}
        fixedWeekCount={false}
        showNonCurrentDates={false}
        moreLinkContent={(args) => {
          return `+${args.num} more`;
        }}
        dayCellClassNames="custom-day-cell"
        eventClassNames="custom-event-cell"
        handleWindowResize={true}
        slotDuration={"00:30:00"} 
        slotLabelInterval={"01:00"} 
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: "short",
        }}
        weekends={true}

      />
    </div>
  );
};

export default Calender;
