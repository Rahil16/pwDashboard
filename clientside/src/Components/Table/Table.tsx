import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";

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
interface tabletype {
  data: Order[];
}

const TableOnClick: React.FC<tabletype> = ({ data }) => {
  const tableHeaders = [
    "id",
    "Category",
    "CITY",
    "DEALSIZE",
    "MSRP",
    "MONTH_ID",
    "ORDERDATE",
    "ORDERLINENUMBER",
    "ORDERNUMBER",
    "PRICEEACH",
    "PRODUCTCODE",
    "Product",
    "QTR_ID",
    "QUANTITYORDERED",
    "SALES",
    "STATE",
    "STATUS",
    "Sales_Goal",
    "TERRITORY",
    "YEAR_ID",
    "margin"
  ];
  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {tableHeaders.map((item, index) => (
                <TableCell key={index}>{item}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {tableHeaders.map((header, index) => (
                  <TableCell key={index}>{(() => {
                    const value = item[header as keyof Order];
                    if (value instanceof Date) {
                      return value.toLocaleDateString();
                    }
                    return String(value);
                  })()}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TableOnClick;
