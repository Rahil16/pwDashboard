import "../../styles/styles.css";
import { BarChart } from "@mui/x-charts/BarChart";
import axios from "axios";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";
import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { axisClasses, LineChart } from "@mui/x-charts";
import TableOnClick from "../Table/Table";
import MenuIcon from "@mui/icons-material/Menu";

interface Order {
  id: number;
  Category: string;
  City: string;
  DealSize: string;
  MSRP: string;
  Month_ID: number;
  OrderDate: string | Date;
  OrderLineNumber: number;
  OrderNumber: number | string;
  PriceEach: string;
  Product: string;
  ProductCode: string;
  Qtr_ID: number;
  QuantityOrdered: number;
  Sales: number;
  State: string;
  Status: string;
  Territory: string;
  margin: number;
  Year_ID: number;
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
  const [tempData,setTempData] = useState<Order[]>(data);
  
  const [filterSearch, setFilterSearch] = useState({
    region: "",
    orderID: "",
  });
  const [LineChartYear, setLineChartYear] = useState("2023");

  type GroupByKey = "City" | "Product" | "Territory";
  type GroupByType = "Sales" | "QuantityOrdered" | "margin";
  const [selectedDate, setSelectedtDate] = useState<DateType>({
    firstDate: undefined,
    secondDate: undefined,
  });
  const [activeFilter, setActiveFilter] = useState<ActiveFilter[]>([]);
  const [clickedOrderNo, setclickedOrderNo] = useState<string | number | null>(
    null
  );
  const [chartFilter, setChartFilter] = useState<GroupByKey>("City");
  const [chartType, setChartType] = useState<GroupByType>("Sales");
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
          "https://app-2b6ed3f7-5352-4055-9ac8-7446afa8a1a3.cleverapps.io/orders"
        );
        setData(response.data);
      } catch (error) {
        console.log("error in fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => setFilteredData(data), [data]);

  const uniqueCities = [...new Set(data.map((item) => item.City))];
  const searchUniqueCity: string[] =
    filterSearch.region.trim() == ""
      ? uniqueCities
      : uniqueCities.filter((item: string) =>
          item.toLowerCase().includes(filterSearch.region.toLowerCase())
        );

  const MemoChart = React.memo(BarChart);

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
            dayjs(item.OrderDate) <= dayjs(selectedDate.secondDate).endOf('day') &&
            dayjs(item.OrderDate) >= dayjs(selectedDate.firstDate).endOf('day')
        )
        
      );

      setTempData(
        filteredData.filter(
          (item) =>
            dayjs(item.OrderDate) <= dayjs(selectedDate.secondDate).endOf('day') &&
            dayjs(item.OrderDate) >= dayjs(selectedDate.firstDate).endOf('day')
        ))
      
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
          (item) => item.City === filter.value
        );
      } else if (filter.type === "date") {
        newFilteredData = newFilteredData.filter(
          (item) =>
            new Date(item.OrderDate) <=
              new Date(filter.value.split(" to ")[1]) &&
            new Date(item.OrderDate) >= new Date(filter.value.split(" to ")[0])
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

  const sortedSalesByCity = Object.entries(salesByCity).sort(
    ([, valueA], [, valueB]) => valueB - valueA
  );

  const chartData = sortedSalesByCity.map(([city, value]) => ({
    x: city,
    y: value,
  }));

  console.log(LineChartYear);
  

  const salesByMonth = data
    .filter((item) => item.OrderDate.toLocaleString().slice(0, 4) === LineChartYear)
    .reduce((add, item) => {
      const key = item["Month_ID"];
      const type = item[chartType];

      if (add[key]) {
        add[key] += Number(type as unknown as string);
      } else {
        add[key] = Number(type as unknown as string);
      }
      return add;
    }, {} as Record<string, number>);

    

  const chartWidth = Math.max(chartData.length * 50, 600);

  const LineChartData = Object.entries(salesByMonth).map(([city, value]) => ({
    x: city,
    y: value,
  }));
console.log(activeFilter);

  

  //possibility of causing filtering issues
  const filterByCity2 = (city: string) => {

    setActiveFilter((prev) => {
      const updatedFilter: ActiveFilter[] = [
        ...prev,
        { type: "city", value: city },
      ];
      if (activeFilter.some(filter => filter.type==="date")){
        setFilteredData(
          updatedFilter.map((item) => item.value).length > 0
            ? tempData.filter((item2) =>
                updatedFilter.map((item3) => item3.value).includes(item2.City)
              )
            : filteredData
        );
      } else{
        setFilteredData(
          updatedFilter.map((item) => item.value).length > 0
            ? data.filter((item2) =>
                updatedFilter.map((item3) => item3.value).includes(item2.City)
              )
            : filteredData
        );
      }
      
      return updatedFilter;
    });
  };

  return (
    <div>
      <div className="dashboard">
        <div style={{ display: "flex" }}>
          <div className="filter-container">
            <div className="filter-box">
              <label className="date-label">Filter By:</label>
              <button
                className="filter-btn"
                onClick={() => setChartFilter("City")}
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
                onClick={() => setChartFilter("Territory")}
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
                    ? dayjs(selectedDate.firstDate).startOf('day') 
                    : null
                  }
                  className="date-inpt"
                  label="Enter From Date"
                  disableFuture
                  onChange={(newValue) =>
                    setSelectedtDate({ ...selectedDate, firstDate: newValue ? dayjs(newValue).endOf('day') : null  })
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
                    setSelectedtDate({ ...selectedDate, secondDate: newValue ? dayjs(newValue).endOf('day') : null  })
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
            <div className="filter-box">
              <input
                type="text"
                name="region"
                placeholder="City"
                className="filter-search"
                value={filterSearch.region}
                onChange={handleSearchChange}
              />
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
            {/* <div className="filter-box">
              <input
                type="text"
                name="orderID"
                value={filterSearch.orderID}
                placeholder="Order Id"
                className="filter-search"
                onChange={handleSearchChange}
              />
              <button
                type="submit"
                onClick={() => {
                  filterByOrderId(Number(filterSearch.orderID));
                }}
                className="date-submitbtn"
                style={{ width: "90%", marginTop: "5%" }}
              >
                Submit
              </button>
            </div> */}
          </div>
          <div className="filters-left"></div>
          <div className="title-chart-container">
            <div className="title">Performance Dashboard</div>
            <p className="sub-title">Get summary of your sales here,</p>
            <div style={{ display: "flex", justifyContent: "end" }}>
              <IconButton onClick={handleOpen}>
                <MenuIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={isOpen} onClose={handleClose}>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    setChartType("Sales");
                  }}
                >
                  Sales
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    setChartType("QuantityOrdered");
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
              <div className="variations"></div>
              <div className="barchart">
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
                        <TableOnClick
                          data={data.filter(
                            (item) => item.City === clickedOrderNo
                          )}
                        />
                      </div>
                    ) : (
                      <MemoChart
                        xAxis={[
                          {
                            label:
                              chartFilter === "City"
                                ? "Cities"
                                : chartFilter === "Product"
                                ? "Products"
                                : "Territories",

                            labelStyle: {
                              fontWeight: "bolder",
                            },
                            

                            labelFontSize: 15,
                            scaleType: "band",
                            data: chartData.map((item) => item.x),
                            dataKey: "City",
                            
                            tickLabelStyle: {
                              fontSize: 8,
                              angle: 45,
                              textAnchor: "start",
                            },
                          },
                        ]}
                      
                        margin={{
                          left: 70,
                          right: 20,
                          bottom: 80,
                        }}
                        sx={{
                          [`.${axisClasses.left} .${axisClasses.label}`]: {
                            transform: "translateX(-30px)",
                          },
                          [`.${axisClasses.bottom} .${axisClasses.label}`]: {
                            transform: `translate(-${
                              chartWidth * 0.385
                            }px,30px)`,
                          },
                        }}
                        
                        slotProps={{
                          legend: {
                            position: {
                              horizontal: "left",
                              vertical: "top",
                            },
                            padding: {
                              left: 200,
                            },
                          },
                        }}
                        yAxis={[
                          {
                            label:
                              chartType === "Sales"
                                ? "Total Sales"
                                : chartType === "QuantityOrdered"
                                ? "Total Orders"
                                : "Total Margins",
                            labelStyle: {
                              fontWeight: "bolder",
                            },
                            labelFontSize: 15,
                            // min: Math.min(...Object.values(salesByCity)) * 1.1,
                            // max: Math.max(...Object.values(salesByCity)) * 1.1,
                            tickLabelStyle: {
                              fontSize: 8,
                            },
                          },
                        ]}
                        onItemClick={(_e, itemIndex) => {
                          const clickedItem =
                            Object.keys(salesByCity)[itemIndex.dataIndex];
                          console.log(
                            Object.keys(salesByCity)[itemIndex.dataIndex]
                          );
                          if (clickedItem) {
                            setclickedOrderNo(clickedItem);
                          }
                        }}
                        axisHighlight={{ x: "none", y: "none" }}
                        tooltip={{
                          trigger: "axis",
                        }}
                        borderRadius={2}
                        series={[
                          {
                            data: chartData.map((item) => item.y),
                            label: `${
                              chartType === "Sales"
                                ? "Total Sales"
                                : chartType === "QuantityOrdered"
                                ? "Total Orders"
                                : "Total Margins"
                            } by ${chartFilter}`,
                            color: "#BFE8FF",
                          },
                        ]}
                        width={chartWidth}
                        height={320}
                      />
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
                <select value={LineChartYear} onChange={(e) => setLineChartYear(e.target.value)} className="dropdown">
                  <option value="2021" >2021</option>
                  <option value="2022" >2022</option>
                  <option value="2023" selected >2023</option>
                </select>
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
                      tickLabelStyle: {
                        fontSize: 10,
                      },
                    },
                  ]}
                  slotProps={{
                    legend: {
                      position: {
                        horizontal: "left",
                        vertical: "top",
                      },
                      padding: {
                        left: 200,
                      },
                    },
                  }}
                  margin={{left:100}}
                  yAxis={[{
                    scaleType:"linear",
                    label:"Sales",
                    tickFontSize:10
                  }]}
                  sx={{
                    "& .MuiAreaElement-series-Sales": {
                      fill: "url(#myGradient)",
                    },
                    [`.${axisClasses.left} .${axisClasses.label}`]: {
                      transform: "translateX(-30px)",
                      fontWeight:"bold"
                    },
                  }}
                  series={[
                    {
                      id: "Sales",
                      data: LineChartData.map((item) => item.y),
                      label: "Daily Sales",
                      color: "#0095FF",
                      showMark: false,
                      curve: "linear",
                      area: true,
                    },
                  ]}
                  width={1200}
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
