import { Hub, HubId, HubStatus } from "@/lib/hub/types";
import { createContext, useCallback, useReducer } from "react";
import { TelemetryEvent } from "../telemetry/types";

/* ──────────────────────────
   Actions
────────────────────────── */

type HubAction =
  | { type: "ADD_HUB"; hub: Hub }
  | { type: "REMOVE_HUB"; id: HubId }
  | { type: "DISCONNECT_HUB"; id: HubId }
  | { type: "HUB_TELEMETRY_RECEIVED"; id: HubId; event: TelemetryEvent };

/* ──────────────────────────
   Context
────────────────────────── */

interface HubsContextValue {
  hubs: Hub[];
  getHub: (id: HubId) => Hub;
  addHub: (hub: Hub) => void;
  removeHub: (id: HubId) => void;
  replaceHub: (id: HubId, hub: Hub) => Hub;
  processTelemetryEvent: (id: HubId, event: TelemetryEvent) => void;
  disconnectHub: (id: HubId) => void;
}

export const HubsContext = createContext<HubsContextValue | undefined>(undefined);

/* ──────────────────────────
   Initial hub
────────────────────────── */

export const idleHub: Hub = {
  id: "untitled-hub",
  name: "Untitled Hub",
  status: HubStatus.Idle,
};

/* ──────────────────────────
   Reducer helpers
────────────────────────── */

function applyTelemetryToModel(prevHub: Hub, event: TelemetryEvent): Hub {
  const nextHub: Hub = { ...prevHub };

  switch (event.type) {
    case "HubDevices":
      const devices = new Map();

      event.devices.forEach((device, port) => {
        switch (device) {
          case "motor":
            devices.set(port, { type: "motor", motor: {} });
            break;
          case "color-distance-sensor":
            devices.set(port, { type: "color-distance-sensor", colorDistanceSensor: {} });
            break;
        }
      });

      nextHub.devices = devices;

      break;

    // case "HubState":
    //   nextHub.batteryPercentage = event.batteryPercentage;
    //   break;

    // case "HubIMU":
    //   nextHub.imu = {
    //     pitch: event.pitch,
    //     roll: event.roll,
    //     heading: event.heading,
    //   };
    //   break;

    // case "MotorLimits": {
    //   nextHub.motors ||= new Map();
    //   const prevMotor = nextHub.motors.get(event.port);

    //   nextHub.motors.set(event.port, {
    //     ...prevMotor,
    //     limits: {
    //       speed: event.speed,
    //       acceleration: event.acceleration,
    //       torque: event.torque,
    //     },
    //   });
    //   break;
    // }

    // case "MotorState": {
    //   nextHub.motors ||= new Map();
    //   const prevMotor = nextHub.motors.get(event.port);

    //   nextHub.motors.set(event.port, {
    //     ...prevMotor,
    //     angle: event.angle,
    //     speed: event.speed,
    //     load: event.load,
    //     isStalled: event.isStalled,
    //   });
    //   break;
    // }

    // case "SensorState":
    //   nextHub.sensors ||= new Map();
    //   nextHub.sensors.set(event.port, {
    //     type: event.sensorType,
    //     values: [event.value0, event.value1, event.value2, event.value3],
    //   });
    //   break;
  }

  return nextHub;
}

/* ──────────────────────────
   Reducer
────────────────────────── */

function hubsReducer(state: Map<HubId, Hub>, action: HubAction): Map<HubId, Hub> {
  const nextState = new Map(state);

  switch (action.type) {
    case "ADD_HUB":
      nextState.set(action.hub.id, action.hub);
      return nextState;

    case "REMOVE_HUB":
      nextState.delete(action.id);
      return nextState;

    case "DISCONNECT_HUB": {
      const hub = nextState.get(action.id);
      if (!hub) return state;

      nextState.set(action.id, {
        id: hub.id,
        name: hub.name,
        status: HubStatus.Idle,
      });

      return nextState;
    }

    case "HUB_TELEMETRY_RECEIVED": {
      const hub = nextState.get(action.id);
      if (!hub) return state;

      const updatedHub = applyTelemetryToModel(hub, action.event);
      nextState.set(action.id, updatedHub);
      return nextState;
    }

    default:
      return state;
  }
}

/* ──────────────────────────
   Provider
────────────────────────── */

export function HubsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(hubsReducer, new Map<HubId, Hub>([[idleHub.id, idleHub]]));

  const getHub = useCallback(
    (id: HubId) => {
      const hub = state.get(id);
      if (!hub) throw new Error(`Hub not found: ${id}`);
      return hub;
    },
    [state],
  );

  const addHub = useCallback((hub: Hub) => {
    dispatch({ type: "ADD_HUB", hub });
  }, []);

  const removeHub = useCallback((id: HubId) => {
    dispatch({ type: "REMOVE_HUB", id });
  }, []);

  const replaceHub = useCallback((id: HubId, hub: Hub) => {
    dispatch({ type: "REMOVE_HUB", id });
    dispatch({ type: "ADD_HUB", hub });
    return hub;
  }, []);

  const processTelemetryEvent = useCallback((id: HubId, event: TelemetryEvent) => {
    dispatch({ type: "HUB_TELEMETRY_RECEIVED", id, event });
  }, []);

  const disconnectHub = useCallback((id: HubId) => {
    dispatch({ type: "DISCONNECT_HUB", id });
  }, []);

  return (
    <HubsContext.Provider
      value={{
        hubs: Array.from(state.values()),
        getHub,
        addHub,
        removeHub,
        replaceHub,
        processTelemetryEvent,
        disconnectHub,
      }}
    >
      {children}
    </HubsContext.Provider>
  );
}
