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
import { LineChart } from "@mui/x-charts";
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
  margin:number;
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
  const [filterSearch, setFilterSearch] = useState({
    region: "",
    orderID: "",
  });
  type GroupByKey = "City" | "Product" |"Territory";
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
  const [chartType,setChartType] = useState<GroupByType>("Sales");
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
          "https://pwdashboard-production.up.railway.app/orders"
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

  const filterByCity = (item: string) => {
    setFilteredData(filteredData.filter((item1) => item1.City === item));
    setActiveFilter((prev) => [...prev, { type: "city", value: item }]);
  };
  const filterByOrderId = (item: number) => {
    setFilteredData(filteredData.filter((item1) => item1.OrderNumber === item));
    setActiveFilter((prev) => [
      ...prev,
      { type: "orderID", value: item.toString() },
    ]);
  };
  const filterByDate = () => {
    if (selectedDate.firstDate && selectedDate.secondDate) {
      setFilteredData(
        filteredData.filter(
          (item) =>
            dayjs(item.OrderDate) <= selectedDate.secondDate! &&
            dayjs(item.OrderDate) >= selectedDate.firstDate!
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
    const key = item[chartFilter]
    const type = item[chartType]

    if (add[key]) {
          add[key] += Number(type as unknown as string);
        } else {
          add[key] = Number(type as unknown as string);
        }
    return add;
  }, {} as Record<string, number>);
  const chartWidth = Math.max(Object.keys(salesByCity).length * 50,600);

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
                      ? dayjs(selectedDate.firstDate)
                      : null
                  }
                  className="date-inpt"
                  label="Enter From Date"
                  disableFuture
                  onChange={(newValue) =>
                    setSelectedtDate({ ...selectedDate, firstDate: newValue })
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
                    setSelectedtDate({ ...selectedDate, secondDate: newValue })
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
                placeholder="Region"
                className="filter-search"
                value={filterSearch.region}
                onChange={handleSearchChange}
              />
              {searchUniqueCity.map((item, index) => (
                <button
                  className="filter-btn"
                  key={index}
                  onClick={() => {
                    filterByCity(item);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="filter-box">
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
            </div>
          </div>
          <div className="filters-left"></div>
          <div className="title-chart-container">
            <div className="title">Performance Dashboard</div>
            <p className="sub-title">Get summary of your sales here,</p>
            <div style={{display:"flex",justifyContent:"end"}}>
              <IconButton onClick={handleOpen}>
                <MenuIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={isOpen} onClose={handleClose}>
                <MenuItem onClick={()=>{handleClose(); setChartType("Sales")}}>Sales</MenuItem>
                <MenuItem onClick={()=>{handleClose(); setChartType("QuantityOrdered")}}>Orders</MenuItem>
                <MenuItem onClick={()=>{handleClose(); setChartType("margin")}}>Margin</MenuItem>
              </Menu>
            </div>
            {activeFilter.length > 0 && (
              <div style={{ display: "flex", gap: "1%" }}>
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
                            scaleType: "band",
                            data: Object.keys(salesByCity),
                            dataKey: "City",
                            tickLabelStyle: {
                              fontSize: 8,
                              angle: 45,
                              textAnchor: "start",
                            },
                          },
                        ]}
                        
                        yAxis={[
                          {
                            
                            min: Math.min(...Object.values(salesByCity))*1.1,
                            max: Math.max(...Object.values(salesByCity))*1.1,
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
                        axisHighlight={{ x: "band", y: "none" }}
                        tooltip={{
                          trigger: "axis",
                        }}
                        borderRadius={2}
                        series={[
                          {
                            data: Object.values(salesByCity),
                            label: "Series Label",
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
                <LineChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: Object.keys(salesByCity),
                      valueFormatter: (id) => {
                        const correspondingOrder = filteredData.find(
                          (item) => item.id === id
                        );
                        return `${correspondingOrder?.OrderNumber || id}`;
                      },
                      dataKey: "OrderNumber",
                      min: 0,
                      max: filteredData.length - 1,
                      tickLabelStyle: {
                        fontSize: 10,
                      },
                    },
                  ]}
                  sx={{
                    "& .MuiAreaElement-series-Sales": {
                      fill: "url(#myGradient)",
                    },
                  }}
                  series={[
                    {
                      id: "Sales",
                      data: Object.values(salesByCity),
                      label: "Series Label",
                      color: "#0095FF",
                      showMark: false,
                      curve: "linear",
                      area: true,
                    },
                  ]}
                  width={chartWidth}
                  height={225}
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
