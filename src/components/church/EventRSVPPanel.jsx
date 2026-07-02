import EventRegistrationPanel from "./EventRegistrationPanel";

/** @deprecated Use EventRegistrationPanel */
export default function EventRSVPPanel(props) {
  return <EventRegistrationPanel {...props} mode="rsvp" />;
}