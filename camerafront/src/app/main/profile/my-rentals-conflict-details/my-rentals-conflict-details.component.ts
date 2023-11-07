import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Expression, FilterExpressionUtils, OTableComponent, OntimizeService } from 'ontimize-web-ngx';

@Component({
  selector: 'app-my-rentals-conflict-details',
  templateUrl: './my-rentals-conflict-details.component.html',
  styleUrls: ['./my-rentals-conflict-details.component.css']
})

export class MyRentalsConflictDetailsComponent implements OnInit {
  @ViewChild('table2', { static: true }) table2: OTableComponent;
  constructor(
    protected productRequestService: OntimizeService,
    @Inject(MAT_DIALOG_DATA) public data: any = { statusname: "" },
    public dialogRef: MatDialogRef<MyRentalsConflictDetailsComponent>,
  ) { }

  ngOnInit() {
    this.configureService();
    let kv = this.configureFilter();
    this.productRequestService.query(kv, ['main_photo', 'id_prequest', 'product_name', 'start_date', 'end_date', 'tproducts_id_product', 'state', 'price', 'request_text', 'r_user', 'p_user'], 'myProductRequestEntry', { start_date: 91, end_date: 91 }).subscribe(
      result => {
        if (result.data && result.data.length) {
          let resultArr = [];
          for (let element of result.data) {
            if (element.id_prequest !== this.data.id_prequest) {
              resultArr.push(element);
            }
          }
          this.table2.setDataArray(resultArr);
        }
      }
    );
  }

  private configureFilter() {
    let filters: Array<Expression> = [];
    filters.push(FilterExpressionUtils.buildExpressionLessEqual("start_date", this.data.end_date));
    filters.push(FilterExpressionUtils.buildExpressionMoreEqual("end_date", this.data.start_date));
    let kv = { '@basic_expression': filters.reduce((exp1, exp2) => FilterExpressionUtils.buildComplexExpression(exp1, exp2, FilterExpressionUtils.OP_AND)) };
    kv['tproducts_id_product'] = this.data.tproducts_id_product;
    kv['state'] = "pending";
    return kv;
  }

  protected configureService() {
    const conf = this.productRequestService.getDefaultServiceConfiguration('productsRequest');
    this.productRequestService.configureService(conf);
  }

  updateState() {
    let tableData = this.table2.getDataArray();
    console.log(tableData);
    this.updateRequests(tableData, "denied");
    this.updateRequests([this.data], "applied");
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  updateRequests( tData, state) {
    let atribMap = {
      "state": state
    }
    for (let element of tData) {
      this.productRequestService.update({ "id_prequest": element.id_prequest }, atribMap, "productRequest").subscribe(
        response => {
          if (response) {
            console.log("Modificado " + element.product_name + " REQUEST ID:" + element.id_prequest + " STATE:" + state );
          } else {
            console.error("Invalid data format in API response.");
          }
        });
    }
  }
}
