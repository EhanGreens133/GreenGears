import React from "react";
import { useState, useRef, useEffect } from "react";
// Dependency
import axios from "axios";

// MUI
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
//
import PuffLoader  from "react-spinners/ClipLoader";
import "./App.css";
// recharts
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  // ResponsiveContainer,
  ScatterChart,
  Scatter,
  // Cell,
} from "recharts";

const App = () => {
  // const [data, setData] = useState([{}]);
  const [schedule, setSchedule] = useState([{}]);
  // the year selected in the autocomplete
  const [selectedYear, setSelectedYear] = useState("");
  // unique list off all the drivers in the event and session selected
  const [driverList, setDriverList] = useState([]);
  const [lapData, setLapData] = useState();
  // the schedule selected in the autocomplete
  const [selectedSchedule, setSelectedSchedule] = useState("");
  // the event selected in the button group
  const [selectedEvent, setSelectedEvent] = useState("");
  const [driverData, setDriverData] = useState();
  const [trackData, setTrackData] = useState();
  // obtain summary
  // const [summary, setSummary] = useState();
  const [boxSize, setBoxSize] = useState();
  const boxRef = useRef(null);

  useEffect(() => {
    if (boxRef.current) {
      const boxWidth = boxRef.current.offsetWidth;
      setBoxSize(boxWidth)
      // console.log(boxWidth); // this will log the width of the Box element
    }
  }, []);

  // console.log('first', boxSize)

  // * ---------------
  // ? ----------------Information Card ---------------------------------
  const infoCard = (
    <React.Fragment>
      <CardContent sx={{ bgcolor: "#EDEDED" }}>
        <Typography variant="h5"  gutterBottom>
          {selectedSchedule}
        </Typography>
        <Typography  component="div">
          {selectedYear}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {selectedEvent}
        </Typography>
      </CardContent>
    </React.Fragment>
  );
  // ?--------------------------------------------------------------------
  const handleYearChange = (event, value) => {
    setSelectedYear(value);
    axios
      .get(`${process.env.REACT_APP_API_URL}/schedule`, {
        params: {
          selectedYear: value,
        },
      })
      .then((response) => {
        setSchedule(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };


  const yearOptions = ["2019", "2020", "2021", "2022", "2023"];

  const scheduleValues = schedule.length === 1 ? [] : Object.values(schedule);

  const handleEvent = (buttonText) => {
    setSelectedEvent(buttonText);
  };
  // console.log('selectedYear', selectedYear)
  // console.log("selectedSchedule", selectedSchedule);
  // console.log("selectedEvent", selectedEvent);

  const handleLoad = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/lapData`, {
        params: {
          selectedYear: selectedYear,
          selectedSchedule: selectedSchedule,
          selectedEvent: selectedEvent,
        },
      })
      .then((response) => {
        setLapData(response.data);
      })
      .catch((error) => {
        console.error(error);
        window.alert('The selected session is not available or it has not yet been loaded by the F1 API');
      });
  };
  // console.log("summary", summary);
  // Obtain a unique array of drivers
  const uniqueDriverList = lapData
    ? Array.from(new Set(Object.values(lapData.Driver)))
    : [];
  // console.log("uniqueDriverList", uniqueDriverList);

  const handleDriverSelect = (e, value) => {
    setDriverList(value);
  };
  // console.log('lapData', lapData)
  // filter data based on selected drivers
  const filteredData = lapData
    ? Object.keys(lapData.Driver).reduce((acc, key) => {
        if (driverList.includes(lapData.Driver[key])) {
          const driver = lapData.Driver[key];
          const team = lapData.Team[key];
          if (!acc[driver]) {
            acc[driver] = {
              team,
              laps: [],
            };
          }
          acc[driver].laps.push({
            lapNumber: lapData.LapNumber[key],
            lapTime: lapData.LapTime[key],
            compound: lapData.Compound[key],
            tyre: lapData.TyreLife[key],
            
          });
        }
        return acc;
      }, {})
    : {};

  const chartData = Object.keys(filteredData).map((driver) => ({
    driver,
    team: filteredData[driver].team, // add team name to chartData
    data: filteredData[driver].laps,
  }));

  const teamColors = {
    Mercedes: "#00D2BE",
    "Red Bull Racing": "#0600EF",
    Ferrari: "#DC0000",
    McLaren: "#FF8700",
    "Aston Martin": "#006F62",
    Alpine: "#0090FF",
    AlphaTauri: "white",
    "Alfa Romeo": "#900000",
    "Haas F1 Team": "#F0D787",
    Williams: "#005AFF",
    // ... add more teams and colors as needed
  };

  const driveColors = {
    'VER': "#ff7f0f", 
    'RUS': "#008073" , 
    'SAI': "#dc0000" , 
    'HAM': "#00d2be",
    'OCO': "#0d5c63" ,
    'HUL': "#ffffff" ,
    'ZHO': "#7b848f" ,
    'ALB': "#005aff" ,
    'TSU': "#f938ab" ,
    'DEV': "#2b4562" , 
    'MAG': "#e6e6e6" ,
    'STR': "#00afff" ,
    'LEC': "#dc0000" ,
    'ALO': "#00afff",
    'PER': "#1e41ff" ,
    'GAS': "#0d5c63" ,
    'NOR': "#ff8700" ,
    'SAR': "#005aff" ,
    'BOT': "#990000" ,
    'PIA': "#fee902" 
  };

  const driverColors = {};
  chartData.forEach((item) => {
    if (!driverColors[item.team]) {
      // use team name as key instead of driver name
      driverColors[item.team] = teamColors[item.team]; // use team color from teamColors object
    }
  });

  // console.log("filteredData", filteredData);
  // console.log("chartData", chartData);

  const lapNumbers = chartData.reduce((acc, { data }) => {
    const lapNumbers = data.map(({ lapNumber }) => lapNumber);
    return [...acc, ...lapNumbers];
  }, []);

  const xDomain = [Math.min(...lapNumbers), Math.max(...lapNumbers)];

  const ticks = Array.from(
    { length: xDomain[1] - xDomain[0] + 1 },
    (_, i) => xDomain[0] + i
  );

  const renderLines = () => {
    return chartData.map(({ driver, team, data }) => {
      return (
        <Line
          key={`${driver}-${team}`}
          type="monotone"
          data={data}
          dataKey="lapTime"
          name={driver}
          stroke={driverColors[team]}
          strokeWidth="3"
          activeDot={{fill: "black"}}
          dot={(props) => {
            // define a custom dot function
            const compound = props.payload.compound;
            const tyre = props.payload.tyre;
            const dotColor =
              compound === "SOFT"
                ? "red"
                : compound === "MEDIUM"
                ? "yellow"
                : "white"; // set the color based on the compound
                
            return (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={tyre}
                fill={dotColor}
                stroke={dotColor}
                
                // strokeWidth={2}
              />
            );
          }}
        />
      );
    });
  };

  const [selectedLap, setSelectedLap] = useState(null);
  const handleMouseDown = async (data) => {
    // setActivePoint(data[index]);
    const nameList = []; // create an empty list to store names

    if (data && data.activePayload && data.activePayload.length > 0) {
      data.activePayload.forEach((item) => {
        if (item && item.name && item.name.length > 0) {
          nameList.push(item.name); // add the name of the item to the list
        }
      });
    }
    const lapNumber = data.activePayload[0].payload.lapNumber;
    await setSelectedLap(lapNumber);
    // console.log("nameList", nameList);
    axios
      .get(`${process.env.REACT_APP_API_URL}/driverData`, {
        params: {
          selectedYear: selectedYear,
          selectedSchedule: selectedSchedule,
          selectedEvent: selectedEvent,
          selectedLap: lapNumber,
          driverList: nameList.join(","),
        },
      })
      .then((response) => {
        setDriverData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
    axios
      .get(`${process.env.REACT_APP_API_URL}/track`, {
        params: {
          selectedYear: selectedYear,
          selectedSchedule: selectedSchedule,
          selectedEvent: selectedEvent,
          selectedLap: lapNumber,
          driverList: nameList.join(","),
        },
      })
      .then((response) => {
        setTrackData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  // console.log("selectedLap", selectedLap);
  // console.log("driverData", driverData);
  // console.log("trackData", trackData);
  // !-------------------------------------------------------------------------
  const lineSelectedData = driverData
    ? Object.keys(driverData.Driver).reduce((acc, key) => {
        const driver = driverData.Driver[key];
        if (!acc[driver]) {
          acc[driver] = {
            laps: [],
          };
        }
        acc[driver].laps.push({
          speed: driverData.Speed[key],
          distance: driverData.Distance[key],
          RPM: driverData.RPM[key],
          nGear: driverData.nGear[key],
          throttle: driverData.Throttle[key],
          // team: driverData.Team[key],
        });
        return acc;
      }, {})
    : {};
  // console.log("lineSelectedData", lineSelectedData);
  const chartSelectedData = Object.keys(lineSelectedData).map((driver) => ({
    driver,
    data: lineSelectedData[driver].laps,
  }));
  // console.log("chartSelectedData", chartSelectedData);
  // !-------------------------------------------------------------------------

  const MyLineChart = () => {
    return (
      <div>
        <h2 style={{ textAlign: "center", color: "white" }}>LapTimes</h2>
        <LineChart
          width= {boxSize}
          height={400}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          background={{ fill: "#EDEDED" }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          // cursor="crosshair"
          animationDuration={300}
        >
          <XAxis
            type="number"
            dataKey="lapNumber"
            ticks={ticks}
            domain={xDomain}
            stroke="white"
          />
          <YAxis
            type="number"
            domain={["dataMin - 1", "dataMax + 1"]}
            tickFormatter={(value) => {
              const minutes = Math.floor(value / 60);
              const seconds = Math.floor(value % 60);
              const milliseconds = Math.floor((value % 1) * 1000);
              return `${minutes}:${seconds
                .toString()
                .padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
            }}
            stroke="white"
          />
          <CartesianGrid strokeDasharray="5 5" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#000000",
              borderColor: "white",
              opacity: 0.99,
              borderRadius: 10,
            }}
            labelStyle={{
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            }}
            itemStyle={{ fontWeight: "bold", margin: "5px 5px" }}
            labelFormatter={(value) => `Lap ${value}`}
            formatter={(value, name, props) => {
              const compound = props.payload.compound;
              const tyreLife = props.payload.tyre;
              const minutes = Math.floor(value / 60);
              const seconds = Math.floor(value % 60);
              const milliseconds = Math.floor((value % 1) * 1000);
              return `${minutes}:${seconds
                .toString()
                .padStart(2, "0")}:${milliseconds
                .toString()
                .padStart(3, "0")} (${compound}) (${tyreLife})`;
            }}
            cursor={{ stroke: "#5B8FB9", strokeWidth: 2 }}
          />
          <Legend />
          {renderLines()}
        </LineChart>
      </div>
    );
  };
  // Todo ------------ Track graph
  const convertedData = trackData ? Object.entries(trackData).map(
    ([name, [x, y, driver]]) => ({
      name,
      x: Number(x),
      y: Number(y),
      driver,
    })
  ): [];
  // console.log("convertedData", convertedData);

  const Track = () => {
    return (
      <ScatterChart width={boxSize/2} height={400}>
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis type="number" dataKey="x" name="X" display="none"/>
        <YAxis type="number" dataKey="y" name="Y" display="none"/>
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Tooltip />
        {convertedData.map((point, index) => (
          <Scatter
            key={index}
            data={[point]}
            fill={driveColors[point.driver]}
          />
        ))}
        {/* <Scatter name="speed" data={convertedData} fill="#8884d8" /> */}
      </ScatterChart>
    );
  };

  // console.log('chartSelectedData', chartSelectedData)
  const renderSyncLines = (dataKey, name) => {
    return chartSelectedData.map(({ driver, data }, index) => {
      return (
        <Line
          key={`${driver}-${dataKey}`}
          type="monotone"
          data={data}
          dataKey={dataKey}
          name={`${driver} - ${name}`}
          strokeWidth="2"
          dot={false}
          stroke={driveColors[driver]}// set the stroke prop to the selected color
        />
      );
    });
  };
  const MySyncedCharts = () => {
    return (
      <div>
        <h2 style={{ textAlign: "center", color: "white" }}>
          Speed - Lap Selected:{selectedLap}
        </h2>
        <LineChart
          width={boxSize}
          height={400}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          background={{ fill: "#EDEDED" }}
          syncId="driverChart"
        >
          <XAxis type="number" dataKey="distance" stroke="white" />
          <YAxis type="number" stroke="white" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          {renderSyncLines("speed", "Speed")}
        </LineChart>
        <h2 style={{ textAlign: "center", color: "white" }}>
          RPM - Lap Selected:{selectedLap}
        </h2>
        <LineChart
          width={boxSize}
          height={400}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          background={{ fill: "#EDEDED" }}
          syncId="driverChart"
        >
          <XAxis type="number" dataKey="distance" stroke="white" />
          <YAxis type="number" stroke="white" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          {renderSyncLines("RPM", "RPM")}
        </LineChart>
        <h2 style={{ textAlign: "center", color: "white" }}>
          Gear - Lap Selected:{selectedLap}
        </h2>
        <LineChart
          width={boxSize}
          height={400}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          background={{ fill: "#EDEDED" }}
          syncId="driverChart"
        >
          <XAxis type="number" dataKey="distance" stroke="white" />
          <YAxis type="number" stroke="white" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          {renderSyncLines("nGear", "nGear")}
        </LineChart>
        <h2 style={{ textAlign: "center", color: "white" }}>
          Throttle - Lap Selected:{selectedLap}
        </h2>
        <LineChart
          width={boxSize}
          height={400}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          background={{ fill: "#EDEDED" }}
          syncId="driverChart"
        >
          <XAxis type="number" dataKey="distance" stroke="white" />
          <YAxis type="number" stroke="white" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          {renderSyncLines("throttle", "throttle")}
        </LineChart>
      </div>
    );
  };


  // !-----------------------------------------------------------------------------------\

  // console.log("driverList", driverList);
  const autoFormat = {
    width: 300,
    m: 2,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#444444",
    },
    "& .MuiOutlinedInput-root:hover": {
      "& fieldset": {
        borderColor: "#B6EADA",
      },
    },
    "&.Mui-focused .MuiInputLabel-outlined": {
      color: "white",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#B6EADA",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#B6EADA",
    },
    "& .MuiAutocomplete-inputRoot": {
      color: "white",
    },
  };
  // console.log("chartSelectedData.length", chartSelectedData.length);
  return (
    <div style={{ backgroundColor: "#000000" }}>
      <Box sx={{  height: "100%" }}>
        <Stack direction={"row"}>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ width: "100%", color: "#5B8FB9", mt: 2 }}
          >
            GreenGears F1
          </Typography>
          
        </Stack>
        <Divider sx = {{bgcolor:"white"}}/>
        <Stack direction={"row"} sx={{ m: 3}}>
          
          <Autocomplete
            disablePortal
            id="year"
            options={yearOptions}
            disableClearable
            onChange={handleYearChange}
            className="autoComp1"
            sx={autoFormat}
            size="small"
            renderInput={(params) => <TextField {...params} label="Year" />}
          />
          <Autocomplete
            disablePortal
            id="schedule"
            disabled={schedule.length === 1}
            options={
              // {yearOptions}
              scheduleValues
            }
            onChange={(event, value) => setSelectedSchedule(value)}
            className="autoComp2"
            sx={autoFormat}
            size="small"
            renderInput={(params) => <TextField {...params} label="Schedule" />}
          />
          <ButtonGroup
            variant="contained"
            // aria-label="medium secondary button group"
            sx={{ m: 2, height: 50 }}
          >
            <Button
              color={selectedEvent === "Practice 1" ? "primary" : "secondary"}
              onClick={() => handleEvent("Practice 1")}
            >
              {" "}
              P1{" "}
            </Button>
            <Button
              color={selectedEvent === "Practice 2" ? "primary" : "secondary"}
              onClick={() => handleEvent("Practice 2")}
            >
              {" "}
              P2{" "}
            </Button>
            <Button
              color={selectedEvent === "Practice 3" ? "primary" : "secondary"}
              onClick={() => handleEvent("Practice 3")}
            >
              {" "}
              P3{" "}
            </Button>
            <Button
              color={selectedEvent === "Q" ? "primary" : "secondary"}
              onClick={() => handleEvent("Q")}
            >
              {" "}
              Q{" "}
            </Button>
            <Button
              color={selectedEvent === "R" ? "primary" : "secondary"}
              onClick={() => handleEvent("R")}
            >
              {" "}
              R{" "}
            </Button>
          </ButtonGroup>
          <Button
            variant="contained"
            sx={{ m: 2, p: 1, color: "black", backgroundColor: "#B6EADA" }}
            size="small"
            onClick={handleLoad}
          >
            Load Session
          </Button>
        </Stack>
        <Stack direction={"row"}  sx={{ width: "100%"}}>
          <Card variant="outlined" sx = {{mx: 2,mt:"10%", height: 110}}>{infoCard}</Card>{" "}
          <Box
            sx={{
              mx: "1%",
              backgroundColor: "#000000"
            }}
          >
            {trackData !== undefined ? (
              <Track />
            ) : (
              <Skeleton width={900} height={500}></Skeleton>
            )}
          </Box>
        </Stack>
        <Stack>
          <Autocomplete
            multiple
            id="Drivers"
            options={uniqueDriverList}
            // {yearOptions}
            className="autoComp3"
            onChange={handleDriverSelect}
            filterSelectedOptions
            size="small"
            sx={{
              width: "90%",
              m: 2,
              ml: 4,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#444444",
              },
              "& .MuiOutlinedInput-root:hover": {
                "& fieldset": {
                  borderColor: "#B6EADA",
                },
              },
              "&.Mui-focused .MuiInputLabel-outlined": {
                color: "white",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#B6EADA",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#B6EADA",
              },
              "& .MuiAutocomplete-inputRoot": {
                color: "white",
              },
              "& .MuiAutocomplete-tag": {
                color: "white",
                backgroundColor: "gray",
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                // inputProps={{
                //   style: { color: "red" }, // Set the text color here
                // }}
                label="Drivers"
                placeholder="Drivers"
              />
            )}
          />
        </Stack>
        <Stack sx={{ width: "100%"}}>
          <Box
            ref={boxRef}
            sx={{

              borderColor: "white",
              mx: "1%",
              bgcolor: "#03001C",
              opacity: 0.8
            }}
          >
            {chartData !== undefined ? (
              <MyLineChart />
            ) : (
              <Skeleton width={900} height={500}></Skeleton>
            )}
          </Box>
        </Stack>
        <Divider sx={{bgcolor: "white"}}/>
        <Stack sx={{ width: "100%"}}>
          
        </Stack>
        <Stack sx={{ width: "100%" }}>
          <Box
            sx={{
        
              borderColor: "white",
              mx: "1%",
              backgroundColor: "#03001C",
              opacity: 0.8
            }}
          >
            {chartSelectedData.length > 0 ? (
              <MySyncedCharts />
            ) : (
              <PuffLoader color="#36d7b7" />
            )}
          </Box>
        </Stack>
      </Box>
    </div>
  );
};

export default App;
