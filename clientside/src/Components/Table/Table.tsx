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
  Year_ID: number;
}
interface tabletype {
  data: Order[];
}

const TableOnClick: React.FC<tabletype> = ({ data }) => {
  const tableHeaders = [
    "id",
    "Category",
    "City",
    "DealSize",
    "Month_ID",
    "MSRP",
    "OrderDate",
    "OrderLineNumber",
    "OrderNumber",
    "PriceEach",
    "Product",
    "ProductCode",
    "Qtr_ID",
    "QuantityOrdered",
    "Sales",
    "State",
    "Status",
    "Territory",
    "Year_ID",
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
