import "../../styles/styles.css";
// import { BarChart } from "@mui/x-charts/BarChart";
import axios from "axios";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";
import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { Button, Fab, IconButton, Menu, MenuItem, Select } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  AllSeriesType,
  axisClasses,
  BarPlot,
  ChartsAxisHighlight,
  ChartsGrid,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LineChart,
  LinePlot,
  ResponsiveChartContainer,
} from "@mui/x-charts";
import TableOnClick from "../Table/Table";
import MenuIcon from "@mui/icons-material/Menu";
import { ChatBubble } from "@mui/icons-material";

// interface Order {
//   id: number;
//   Category: string;
//   City: string;
//   DealSize: string;
//   MSRP: string;
//   Month_ID: number;
//   OrderDate: string | Date;
//   OrderLineNumber: number;
//   OrderNumber: number | string;
//   PriceEach: string;
//   Product: string;
//   ProductCode: string;
//   Qtr_ID: number;
//   QuantityOrdered: number;
//   Sales: number;
//   State: string;
//   Status: string;
//   Territory: string;
//   margin: number;
//   Year_ID: number;
// }

interface Order {
  id: number;
  Category: string;
  CITY: string;
  DEALSIZE: string;
  MSRP: number;
  MONTH_ID: number;
  ORDERDATE: string | Date;
  ORDERLINENUMBER: number;
  ORDERNUMBER: number | string;
  PRICEEACH: number;
  PRODUCTCODE: string;
  Product: string;
  QTR_ID: number;
  QUANTITYORDERED: number;
  SALES: number;
  STATE: string;
  STATUS: string;
  Sales_Goal: number;
  TERRITORY: string;
  YEAR_ID: number;
  margin: number;
}
interface DateType {
  firstDate: undefined | Dayjs | null;
  secondDate: undefined | Dayjs | null;
}
interface ActiveFilter {
  type: "city" | "date" | "orderID";
  value: string;
}

const Dashboard = () => {
  const [data, setData] = useState<Order[]>([]);
  const [filteredData, setFilteredData] = useState<Order[]>([]);
  const [tempData, setTempData] = useState<Order[]>(data);

  const [filterSearch, setFilterSearch] = useState({
    region: "",
    orderID: "",
  });
  const [LineChartYear, setLineChartYear] = useState("2023");

  type GroupByKey = "CITY" | "Product" | "TERRITORY";
  type GroupByType = "SALES" | "QUANTITYORDERED" | "margin";
  const [selectedDate, setSelectedtDate] = useState<DateType>({
    firstDate: undefined,
    secondDate: undefined,
  });
  const [activeFilter, setActiveFilter] = useState<ActiveFilter[]>([]);
  const [clickedOrderNo, setclickedOrderNo] = useState<string | number | null>(
    null
  );
  const [chartFilter, setChartFilter] = useState<GroupByKey>("CITY");
  const [chartType, setChartType] = useState<GroupByType>("SALES");
  const tableStyle = {
    overflow: clickedOrderNo ? "auto" : undefined,
    height: "100%",
  };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://pwdashboard.onrender.com/orders"
        );
        const arr = Array.isArray(response.data)
          ? response.data
          : Object.values(response.data);
        setData(arr as Order[]);
        console.log(arr as Order[]);
      } catch (error) {
        console.log("error in fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => setFilteredData(data), [data]);

  const uniqueCities = [...new Set(data.map((item) => item.CITY))];
  const searchUniqueCity: string[] =
    filterSearch.region.trim() == ""
      ? uniqueCities
      : uniqueCities.filter((item: string) =>
          item.toLowerCase().includes(filterSearch.region.toLowerCase())
        );

  // const MemoChart = React.memo(BarChart);

  // const filterByOrderId = (item: number) => {
  //   setFilteredData(filteredData.filter((item1) => item1.OrderNumber === item));
  //   setActiveFilter((prev) => [
  //     ...prev,
  //     { type: "orderID", value: item.toString() },
  //   ]);
  // };
  const filterByDate = () => {
    if (selectedDate.firstDate && selectedDate.secondDate) {
      setFilteredData(
        filteredData.filter(
          (item) =>
            dayjs(item.ORDERDATE) <=
              dayjs(selectedDate.secondDate).endOf("day") &&
            dayjs(item.ORDERDATE) >= dayjs(selectedDate.firstDate).endOf("day")
        )
      );

      setTempData(
        filteredData.filter(
          (item) =>
            dayjs(item.ORDERDATE) <=
              dayjs(selectedDate.secondDate).endOf("day") &&
            dayjs(item.ORDERDATE) >= dayjs(selectedDate.firstDate).endOf("day")
        )
      );

      setActiveFilter((prev) => [
        ...prev,
        {
          type: "date",
          value: `${selectedDate.firstDate} to ${selectedDate.secondDate}`,
        },
      ]);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterSearch({
      ...filterSearch,
      [name]: value,
    });
  };

  const removeFilter = (filterToRemove: ActiveFilter) => {
    setActiveFilter((prev) =>
      prev.filter(
        (filter) =>
          filter.type !== filterToRemove.type ||
          filter.value !== filterToRemove.value
      )
    );
    const updatedFilters = activeFilter.filter(
      (filter) =>
        filter.type !== filterToRemove.type ||
        filter.value !== filterToRemove.value
    );

    let newFilteredData = [...data];
    updatedFilters.forEach((filter) => {
      if (filter.type === "city") {
        newFilteredData = newFilteredData.filter(
          (item) => item.CITY === filter.value
        );
      } else if (filter.type === "date") {
        newFilteredData = newFilteredData.filter(
          (item) =>
            new Date(item.ORDERDATE) <=
              new Date(filter.value.split(" to ")[1]) &&
            new Date(item.ORDERDATE) >= new Date(filter.value.split(" to ")[0])
        );
      }
    });

    if (filterToRemove.type === "date") {
      setSelectedtDate({ firstDate: undefined, secondDate: undefined });
    }

    setActiveFilter(updatedFilters);
    setFilteredData(newFilteredData);
  };

  const salesByCity = filteredData.reduce((add, item) => {
    const key = item[chartFilter];
    const type = item[chartType];

    if (add[key]) {
      add[key] += Number(type as unknown as string);
    } else {
      add[key] = Number(type as unknown as string);
    }
    return add;
  }, {} as Record<string, number>);

  const SalesByGoal = filteredData.reduce((add, item) => {
    const key = item[chartFilter];
    const type = item["Sales_Goal"];

    if (add[key]) {
      add[key] += Number(type as unknown as string);
    } else {
      add[key] = Number(type as unknown as string);
    }
    return add;
  }, {} as Record<string, number>);

  const sortedSalesByCity = Object.entries(salesByCity).sort(
    ([, valueA], [, valueB]) => valueB - valueA
  );

  const sortedSalesByGoal = Object.entries(SalesByGoal).sort(
    ([, valueA], [, valueB]) => valueB - valueA
  );
  const chartData = sortedSalesByCity.map(([city, value]) => {
    return {
      x: city,
      y: value,
    };
  });

  const chartDataWithGoal = sortedSalesByGoal.map(([city, value]) => {
    return {
      x: city,
      y: value,
    };
  });

  const salesByMonth = data
    .filter(
      (item) => item.ORDERDATE.toLocaleString().slice(0, 4) === LineChartYear
    )
    .reduce((add, item) => {
      const key = item["MONTH_ID"];
      const type = item["SALES"];

      if (add[key]) {
        add[key] += Number(type as unknown as string);
      } else {
        add[key] = Number(type as unknown as string);
      }
      return add;
    }, {} as Record<string, number>);

  // const chartWidth = Math.max(chartData.length * 50, 2000);
  const containerWidth = window.innerWidth * 0.8;
  const barMinWidth = 50;
  const minChartWidth = containerWidth;
  const chartWidth =
    chartData.length > 12
      ? Math.max(chartData.length * barMinWidth, minChartWidth)
      : minChartWidth;

  const LineChartData = Object.entries(salesByMonth).map(([city, value]) => ({
    x: city,
    y: value,
  }));

  //possibility of causing filtering issues
  const filterByCity2 = (city: string) => {
    setActiveFilter((prev) => {
      const updatedFilter: ActiveFilter[] = [
        ...prev,
        { type: "city", value: city },
      ];
      if (activeFilter.some((filter) => filter.type === "date")) {
        setFilteredData(
          updatedFilter.map((item) => item.value).length > 0
            ? tempData.filter((item2) =>
                updatedFilter.map((item3) => item3.value).includes(item2.CITY)
              )
            : filteredData
        );
      } else {
        setFilteredData(
          updatedFilter.map((item) => item.value).length > 0
            ? data.filter((item2) =>
                updatedFilter.map((item3) => item3.value).includes(item2.CITY)
              )
            : filteredData
        );
      }

      return updatedFilter;
    });
  };

  const filteredTableData =
    chartFilter === "CITY"
      ? data.filter((item) => item.CITY === clickedOrderNo)
      : chartFilter === "Product"
      ? data.filter((item) => item.Product === clickedOrderNo)
      : data.filter((item) => item.TERRITORY === clickedOrderNo);

  console.log(
    "chartData",
    chartData.map((item) => item.y)
  );
  const series: AllSeriesType[] = [
    {
      type: "bar" as const,
      data: chartData.map((item) => item.y),
      label: `${
        chartType === "SALES"
          ? "Total Sales"
          : chartType === "QUANTITYORDERED"
          ? "Total Orders"
          : "Total Margins"
      } by ${
        chartFilter === "CITY"
          ? "City"
          : chartFilter === "Product"
          ? "Product"
          : "Territory"
      }`,
      color: "#BFE8FF",
    },
    ...(chartType === "SALES"
      ? [
          {
            type: "line" as const,
            data: chartDataWithGoal.map((item) => item.y),
            label: "Sales Goal",
            color: "#F93C65",
            showMark: false,
            curve: "linear" as const,
          },
        ]
      : []),
  ];
  return (
    <div>
      <Fab
        aria-label="add"
        style={{ position: "fixed", bottom: "2rem", right: "2rem" }}
        onClick={() => {window.location.href = "https://sales-chatbot-znkw.onrender.com/";}}
      >
        <ChatBubble />
      </Fab>
      <div className="dashboard">
        <div style={{ display: "flex" }}>
          <div className="filters-left"></div>
          <div className="filter-container">
            <div className="filter-box">
              <label className="date-label">Filter By:</label>
              <button
                className="filter-btn"
                onClick={() => setChartFilter("CITY")}
              >
                City
              </button>
              <button
                className="filter-btn"
                onClick={() => setChartFilter("Product")}
              >
                Product
              </button>
              <button
                className="filter-btn"
                onClick={() => setChartFilter("TERRITORY")}
              >
                Territory
              </button>
            </div>
            <div className="filter-box">
              <label className="date-label">Date</label>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="en-gb"
              >
                <DatePicker
                  value={
                    selectedDate.firstDate
                      ? dayjs(selectedDate.firstDate).startOf("day")
                      : null
                  }
                  className="date-inpt"
                  label="Enter From Date"
                  disableFuture
                  onChange={(newValue) =>
                    setSelectedtDate({
                      ...selectedDate,
                      firstDate: newValue ? dayjs(newValue).endOf("day") : null,
                    })
                  }
                  slotProps={{
                    textField: { error: false, size: "small" },
                  }}
                />
                <DatePicker
                  value={
                    selectedDate.secondDate
                      ? dayjs(selectedDate.secondDate)
                      : null
                  }
                  className="date-inpt"
                  label="Enter to Date"
                  disableFuture
                  onChange={(newValue) =>
                    setSelectedtDate({
                      ...selectedDate,
                      secondDate: newValue
                        ? dayjs(newValue).endOf("day")
                        : null,
                    })
                  }
                  slotProps={{
                    textField: { error: false, size: "small" },
                  }}
                />
              </LocalizationProvider>
              <button
                type="submit"
                onClick={filterByDate}
                className="date-submitbtn"
              >
                Submit
              </button>
            </div>
            <div className="city-filter-box">
              <input
                type="text"
                name="region"
                placeholder="City"
                className="filter-search"
                value={filterSearch.region}
                onChange={handleSearchChange}
              />
              <div className="filter-box-n">
                {searchUniqueCity.map((item, index) => (
                  <button
                    className="filter-btn"
                    key={index}
                    onClick={() => {
                      filterByCity2(item);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="title-chart-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1%",
              }}
            >
              <div className="title">Performance Dashboard</div>
              <div style={{ position: "fixed", zIndex: 10, right: "10vw" }}>
                <IconButton
                  onClick={handleOpen}
                  size="large"
                  // aria-haspopup="true"
                  // sx={{
                  //   padding: "8px",
                  //   "&:active": {
                  //     transform: "none", // Prevent the button from moving when clicked
                  //   },
                  // }}
                >
                  {/* <MenuIcon sx={{ width: 32, height: 32, position:isOpen? "fixed": "" }} /> */}
                  <MenuIcon sx={{ width: 32, height: 32 }} />
                  {/* <MenuIcon sx={{ width: 32, height: 32}} /> */}
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={isOpen}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  disableScrollLock={true}
                  slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 7,
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                        },
                      },
                    },
                  }}
                  // transformOrigin={{ horizontal: "right", vertical: "top" }}
                  // anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      setChartType("SALES");
                    }}
                  >
                    Sales
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      setChartType("QUANTITYORDERED");
                    }}
                  >
                    Orders
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      setChartType("margin");
                    }}
                  >
                    Margin
                  </MenuItem>
                </Menu>
              </div>
            </div>
            <div className="sub-title">Get summary of your sales here,</div>

            {activeFilter.length > 0 && (
              <div style={{ display: "flex", gap: "1%", flexWrap: "wrap" }}>
                {activeFilter.map((filter, index) => (
                  <div key={index}>
                    <Button
                      variant="outlined"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {filter.type == "date"
                        ? filter.value
                            .split(" to ")
                            .map((date) =>
                              date.split(" ").slice(1, 4).join(" ")
                            )
                            .join(" to ")
                        : filter.value}
                      <IconButton
                        sx={{ scale: 0.8, margin: "0" }}
                        aria-label="remove filter"
                        onClick={() => removeFilter(filter)}
                        color="primary"
                        size="small"
                      >
                        <CloseOutlinedIcon />
                      </IconButton>
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outlined"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => {
                    setActiveFilter([]);
                    setFilteredData(data);
                  }}
                >
                  CLEAR ALL
                </Button>
              </div>
            )}

            <div className="chart-grid">
              {/* <div className="variations"></div> */}
              <div className="barchart" style={{ position: "relative" }}>
                {/* Sticky Y-axis label */}
                {!clickedOrderNo && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        left: "3%",
                        top: "60%",
                        transform: "translateY(-50%) rotate(-90deg)",
                        transformOrigin: "left center",
                        zIndex: 10,
                        background: "transparent",
                        border: "none",
                        fontWeight: "bolder",
                        fontFamily: "Roboto Flex",
                        fontSize: 20,
                        color: "#202224",
                        padding: "4px 8px",
                        pointerEvents: "none",
                        boxShadow: "0 0 8px #fff",
                        height: "fit-content",
                        width: "max-content",
                      }}
                    >
                      {chartType === "SALES"
                        ? "Total Sales"
                        : chartType === "QUANTITYORDERED"
                        ? "Total Orders"
                        : "Total Margins"}
                    </div>
                    {/* Sticky X-axis label */}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: "12%",
                        transform: "translateX(-50%)",
                        zIndex: 10,
                        background: "transparent",
                        border: "none",
                        fontWeight: "bolder",
                        fontFamily: "Roboto Flex",
                        fontSize: 20,
                        color: "#202224",
                        paddingBottom: "2%",
                        pointerEvents: "none",
                      }}
                    >
                      {chartFilter === "CITY"
                        ? "Cities"
                        : chartFilter === "Product"
                        ? "Products"
                        : "Territories"}
                    </div>
                  </>
                )}

                <div
                  style={{
                    overflowX: "auto",
                    overflowY: "hidden",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <div style={tableStyle}>
                    {clickedOrderNo ? (
                      <div>
                        <TableOnClick data={filteredTableData} />
                      </div>
                    ) : (
                      // <MemoChart
                      //   xAxis={[
                      //     {
                      //       label:
                      //         chartFilter === "CITY"
                      //           ? "Cities"
                      //           : chartFilter === "Product"
                      //           ? "Products"
                      //           : "Territories",

                      //       labelStyle: {
                      //         fontWeight: "bolder",
                      //         transform: "translateY(10px)",
                      //         fontFamily: "Roboto Flex",
                      //         fontSize: 15,
                      //         fill: "#AEAEAE",
                      //       },
                      //       disableLine: true,

                      //       labelFontSize: 15,
                      //       scaleType: "band",
                      //       data: chartData.map((item) => item.x),
                      //       dataKey: "City",

                      //       tickLabelStyle: {
                      //         fontSize: 12,
                      //         fontFamily: "poppins",
                      //         angle: -45,
                      //         textAnchor: "end",
                      //         dominantBaseline: "central",
                      //         fill: "#7B91B0",
                      //       },
                      //       disableTicks: true,
                      //     },
                      //   ]}
                      //   grid={{
                      //     horizontal: true,
                      //   }}
                      //   margin={{
                      //     left: 70,
                      //     right: 20,
                      //     bottom: 80,
                      //   }}
                      //   sx={{
                      //     "& .MuiChartsAxis-gridLine": {
                      //       stroke: "#EFF1F3",
                      //       fill: "#D9D9D9",
                      //     },
                      //     [`.${axisClasses.left} .${axisClasses.label}`]: {
                      //       transform: "translateX(-30px)",
                      //     },
                      //     [`.${axisClasses.bottom} .${axisClasses.label}`]: {
                      //       transform: `translate(-${
                      //         chartWidth * 0.385
                      //       }px,30px)`,
                      //     },
                      //   }}
                      //   slotProps={{
                      //     legend: {
                      //       position: {
                      //         horizontal: "left",
                      //         vertical: "top",
                      //       },
                      //       labelStyle: {
                      //         fontSize: "20",
                      //         fontFamily: "Roboto Flex",
                      //         fontWeight: "semi-bold",
                      //       },

                      //       padding: {
                      //         bottom: 10,
                      //       },
                      //       itemMarkWidth: 0,
                      //       itemMarkHeight: 0,
                      //     },
                      //   }}
                      //   yAxis={[
                      //     {
                      //       label:
                      //         chartType === "SALES"
                      //           ? "Total Sales"
                      //           : chartType === "QUANTITYORDERED"
                      //           ? "Total Orders"
                      //           : "Total Margins",
                      //       labelStyle: {
                      //         fontWeight: "bolder",
                      //         fontFamily: "Roboto Flex",
                      //         fontSize: 15,
                      //         fill: "#AEAEAE",
                      //       },
                      //       disableLine: true,
                      //       disableTicks: true,
                      //       labelFontSize: 15,
                      //       tickLabelStyle: {
                      //         fontSize: 12,
                      //         fontFamily: "poppins",
                      //         fill: "#7B91B0",
                      //         textAnchor: "end",
                      //         marginRight: "10px",
                      //       },
                      //       valueFormatter: (value) => {
                      //         if (value >= 1000000) {
                      //           return `${(value / 1000000).toFixed(1)}M`;
                      //         } else if (value >= 1000) {
                      //           return `${(value / 1000).toFixed(1)}K`;
                      //         }
                      //         return value.toString();
                      //       },
                      //     },
                      //   ]}
                      //   onItemClick={(_e, itemData) => {

                      //       // const clickedCity = chartData[itemIndex];
                      //       // console.log(chartData[itemIndex].x);
                      //       console.log(itemData.dataIndex);
                      //       console.log(chartData[itemData.dataIndex].x);
                      //       const clickedItem = chartData[itemData.dataIndex].x;
                      //     if (clickedItem) {
                      //       setclickedOrderNo(clickedItem);
                      //     }
                      //   }}
                      //   axisHighlight={{ x: "none", y: "none" }}
                      //   tooltip={{
                      //     trigger: "axis",
                      //   }}
                      //   borderRadius={2}
                      //   series={[
                      //     {
                      //       data: chartData.map((item) => item.y),

                      //       label: `${
                      //         chartType === "SALES"
                      //           ? "Total Sales"
                      //           : chartType === "QUANTITYORDERED"
                      //           ? "Total Orders"
                      //           : "Total Margins"
                      //       } by ${chartFilter}`,
                      //       color: "#BFE8FF",
                      //     },
                      //   ]}
                      //   width={chartWidth}
                      //   height={320}
                      // />
                      <div>
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: 20,
                            marginBottom: 12,
                            fontFamily: "Roboto Flex",
                            color: "#404040",
                          }}
                        >
                          {chartType === "SALES"
                            ? "Total Sales"
                            : chartType === "QUANTITYORDERED"
                            ? "Total Orders"
                            : "Total Margins"}{" "}
                          by{" "}
                          {chartFilter.toUpperCase() === "CITY"
                            ? "City"
                            : chartFilter.toUpperCase() === "PRODUCT"
                            ? "Product"
                            : "Territory"}
                        </div>
                        <ResponsiveChartContainer
                          series={series}
                          width={chartWidth}
                          height={320}
                          // width={chartWidth}
                          margin={{
                            left: 70,
                            right: 20,
                            bottom: 110,
                          }}
                          xAxis={[
                            {
                              id: "x",
                              data: chartData.map((item) => item.x),
                              scaleType: "band",
                              labelStyle: {
                                fontWeight: "bolder",
                                transform: "translateY(10px)",
                                fontFamily: "Roboto Flex",
                                fontSize: 15,
                                // fill: "#AEAEAE",
                                fill: "#202224",
                              },
                              tickLabelStyle: {
                                fontSize: 12,
                                fontFamily: "poppins",
                                angle: -45,
                                textAnchor: "end",
                                dominantBaseline: "central",
                                // fill: "#7B91B0",
                                fill: "#202224",
                              },
                              disableLine: true,
                              disableTicks: true,
                            },
                          ]}
                          yAxis={[
                            {
                              id: "y",
                              scaleType: "linear",
                              labelStyle: {
                                fontWeight: "bolder",
                                fontFamily: "Roboto Flex",
                                fontSize: 15,
                                fill: "#AEAEAE",
                              },
                              disableLine: true,

                              disableTicks: true,

                              labelFontSize: 15,
                              tickLabelStyle: {
                                fontSize: 12,
                                fontFamily: "poppins",
                                // fill: "#7B91B0",
                                fill: "#202224",
                                textAnchor: "end",
                                marginRight: "10px",
                              },
                              valueFormatter: (value) => {
                                if (value === 0) return "0";
                                if (value >= 1000000) {
                                  return `${(value / 1000000).toFixed(1)}M`;
                                } else if (value >= 1000 || value <= -1000) {
                                  return `${(value / 1000).toFixed(1)}K`;
                                }
                                return value?.toString() ?? "";
                              },
                            },
                          ]}
                          sx={{
                            // Axis grid lines
                            "& .MuiChartsAxis-gridLine": {
                              stroke: "#EFF1F3",
                              fill: "#D9D9D9",
                            },
                            // Left axis label
                            [`.${axisClasses.left} .${axisClasses.label}`]: {
                              transform: "translateX(-30px)",
                              fontWeight: "bolder",
                              fontFamily: "Roboto Flex",
                              fontSize: 15,
                              fill: "#AEAEAE",
                            },
                            // Bottom axis label
                            [`.${axisClasses.bottom} .${axisClasses.label}`]: {
                              transform: `translate(-${
                                chartWidth * 0.385
                              }px,30px)`,
                              fontWeight: "bolder",
                              fontFamily: "Roboto Flex",
                              fontSize: 15,
                              fill: "#AEAEAE",
                            },
                            // Legend root
                            "& .MuiChartsLegend-root": {
                              position: "absolute",
                              left: 0,
                              top: 0,
                              paddingBottom: 10,
                            },
                            // Legend label
                            "& .MuiChartsLegend-label": {
                              fontSize: 20,
                              fontFamily: "Roboto Flex",
                              fontWeight: 600,
                            },
                            // Hide legend item marks
                            "& .MuiChartsLegend-mark": {
                              width: 0,
                              height: 0,
                            },
                          }}
                        >
                          <ChartsGrid horizontal />
                          <ChartsAxisHighlight x="none" y="none" />
                          <BarPlot
                            onItemClick={(_e, itemData) => {
                              // const clickedCity = chartData[itemIndex];
                              // console.log(chartData[itemIndex].x);
                              console.log(itemData.dataIndex);
                              console.log(chartData[itemData.dataIndex].x);
                              const clickedItem =
                                chartData[itemData.dataIndex].x;
                              if (clickedItem) {
                                setclickedOrderNo(clickedItem);
                              }
                            }}
                          />
                          <LinePlot />
                          <ChartsTooltip trigger="axis" />
                          <ChartsXAxis axisId="x" />
                          <ChartsYAxis axisId="y" />
                        </ResponsiveChartContainer>
                      </div>
                    )}
                  </div>
                </div>
                {clickedOrderNo ? (
                  <button
                    className="date-submitbtn"
                    style={{ width: "40%", marginTop: "5%" }}
                    onClick={() => {
                      setclickedOrderNo(null);
                    }}
                  >
                    Close Table
                  </button>
                ) : null}
              </div>

              <div className="linechart">
                <div className="dropdownDiv">
                  <Select
                    value={LineChartYear}
                    onChange={(e) => setLineChartYear(e.target.value)}
                    className="dropdown"
                    autoWidth
                  >
                    <MenuItem value="2021">2021</MenuItem>
                    <MenuItem value="2022">2022</MenuItem>
                    <MenuItem value="2023" selected>
                      2023
                    </MenuItem>
                  </Select>
                </div>
                <LineChart
                  xAxis={[
                    {
                      scaleType: "point",
                      // data: LineChartData.map(item=>item.x),
                      data: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ],
                      disableLine: true,
                      disableTicks: true,
                      tickLabelStyle: {
                        fontSize: 12,

                        textAnchor: "middle",

                        fontFamily: "poppins",
                        fillOpacity: 6,
                        dominantBaseline: "central",
                        // fill: "#7B91B0",
                        fill: "#202224",
                        transform: "translateY(5%)",
                      },
                      tickPlacement: "middle",
                    },
                  ]}
                  slotProps={{
                    legend: {
                      position: {
                        horizontal: "left",
                        vertical: "top",
                      },

                      labelStyle: {
                        fontSize: "15",
                        fontFamily: "Roboto Flex",
                        fill: "#404040",
                      },
                      padding: {
                        left: 60,
                        bottom: 10,
                      },
                      itemMarkWidth: 0,
                      itemMarkHeight: 0,
                    },
                  }}
                  grid={{
                    horizontal: true,
                  }}
                  margin={{ left: 100 }}
                  yAxis={[
                    {
                      scaleType: "linear",
                      label: `${"Sales"}`,
                      labelStyle: {
                        fontFamily: "Roboto Flex",
                        fontSize: 18,
                        fill: "#202224",
                      },
                      disableLine: true,
                      disableTicks: true,
                      tickFontSize: 12,
                      tickLabelStyle: {
                        fontSize: 12,
                        fontFamily: "poppins",
                        // fill: "#7B91B0",
                        fill: "#202224",
                      },
                      valueFormatter: (value) => {
                        if (value >= 1000000) {
                          return `${(value / 1000000).toFixed(1)}M`;
                        } else if (value >= 1000) {
                          return `${(value / 1000).toFixed(1)}K`;
                        } else if (value <= 1000) {
                          return `${(value / 1000).toFixed(1)}K`;
                        }
                        return value.toString();
                      },
                    },
                  ]}
                  sx={{
                    "& .MuiChartsAxis-gridLine": {
                      stroke: "#EAEAEA",
                      fill: "#FFFFFF",
                    },
                    "& .MuiAreaElement-series-Sales": {
                      fill: "url(#myGradient)",
                    },
                    [`.${axisClasses.left} .${axisClasses.label}`]: {
                      transform: "translateX(-30px)",
                      fontWeight: "bold",
                    },
                  }}
                  series={[
                    {
                      id: "Sales",
                      data: LineChartData.map((item) => item.y),
                      label: `${"Monthly Sales"}`,
                      color: "#0095FF",
                      showMark: false,
                      curve: "linear",
                      area: true,
                    },
                  ]}
                  height={200}
                >
                  <defs>
                    <linearGradient id="myGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0095FF" stopOpacity={0.3} />
                      <stop
                        offset="100%"
                        stopColor="#0095FF"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                </LineChart>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
