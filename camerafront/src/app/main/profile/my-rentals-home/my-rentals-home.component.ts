import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AuthService, DialogService, Expression, FilterExpressionUtils, OColumnComponent, OTableComponent, OntimizeService } from 'ontimize-web-ngx';
import { MyRentalsConflictDetailsComponent } from '../my-rentals-conflict-details/my-rentals-conflict-details.component';
import { calculateProfitFunction } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-my-rentals-home',
  templateUrl: './my-rentals-home.component.html',
  styleUrls: ['./my-rentals-home.component.css']
})

export class MyRentalsHomeComponent implements OnInit {
  @ViewChild('tablein', { static: true }) tableIn: OTableComponent;
  @ViewChild('tableout', { static: true }) tableOut: OTableComponent;
  @ViewChild('table2', { static: true }) table2: OTableComponent;
  @ViewChild('profit', { static: true }) columnProfit: OColumnComponent;
  public calculateProfit = this.calculateProfitFunction;
  constructor(
    private auth: AuthService,
    private ontimizeService: OntimizeService,
    private cd: ChangeDetectorRef,
    protected dialog: MatDialog,
    protected dialogService: DialogService,

    // private data: any
  ) { }
  public data2: any;

  ngOnInit() {
    this.ontimizeService.configureService(this.ontimizeService.getDefaultServiceConfiguration('productsRequest'));
  }
  ngAfterViewInit() {
    //  this.tableIn.queryData({r_user: this.auth.getSessionInfo().user});

    //  this.tableOut.queryData({p_user: this.auth.getSessionInfo().user});
    // const filterExpr = FilterExpressionUtils.buildExpressionLess('end_date', );
    // const basicExpr = FilterExpressionUtils.buildBasicExpression(filterExpr);
    // const complexExpr =FilterExpressionUtils.buildComplexExpression
    // basicExpr['EMPLOYEETYPEID'] = 1;
    // this.table.queryData(basicExpr);
  }

  mayorEdad(event) {
    console.log(event);
    // if(event.state == "applied" || "pending"){
    //   return true;
    // }else 
    return false;

  }
  public calculateProfitFunction(rowData: Array<any>): number {
    const diferenciaEnMilisegundos = rowData["end_date"] - rowData["start_date"];
    // Convertir la diferencia a días
    const diferenciaEnDias = diferenciaEnMilisegundos / (1000 * 60 * 60 * 24);
    return diferenciaEnDias * rowData["price"]
  }
  public openDetail(rowData: any): void {
    rowData["profit"] = this.calculateProfitFunction(rowData);
    this.dialog.open(MyRentalsConflictDetailsComponent, {
      height: '80%',
      width: '75%',
      data: rowData,
      panelClass: 'custom-dialog-container'
    });
    const sub = this.dialog.afterAllClosed.subscribe((data: any) => {
      console.log("Se Cerrro el dialogo")
      this.tableOut.reloadData();
    });
  }
  waitFunc(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  cancelRequest(event) {
    let atribMap = {
      "state": "canceled"
    }
    let keyMap = {
      "id_prequest": event.id_prequest
    }
    if (this.dialogService) {
      if (event.state == "canceled") {
        this.dialogService.info('No se puede realizar la accion', 'El pedido ya ha sido cancelado.');
      } else if (event.state == "denied") {
        this.dialogService.info('No se puede cancelar este pedido', 'El pedido te ha sido denegado.');
      } else {
        this.dialogService.confirm('Confirm cancel request', 'Do you really want to accept?');
        this.dialogService.dialogRef.afterClosed().subscribe(async result => {
          if (result) {
            this.updateRequests(keyMap, atribMap);
            await this.waitFunc(50);
            this.tableIn.reloadData();
          } else {
            console.log("Se ha cancelado el cancelado ;D");
          }

        })
      }
    }

  }
  public loadData(ev) {
    //this.tableOut.getValue();
    this.data2 = ev;
    let exp1 = FilterExpressionUtils.buildExpressionLess("start_date", ev.start_date);
    let exp2 = FilterExpressionUtils.buildExpressionMore("end_date", ev.end_date);
    let filter = FilterExpressionUtils.buildComplexExpression(exp1, exp2, FilterExpressionUtils.OP_AND);
    //filter['tproducts_id_product'] = ev.data.tproducts_id_product;
    filter['state'] = "pending";
    //this.table2.queryData();
  }
  // createFilter(values: Array<{ attr, value }>): Expression {

  //   let filters = [];

  //         filters.push(FilterExpressionUtils.buildExpressionLike(fil.attr, fil.value));
  //         filters.push(FilterExpressionUtils.buildExpressionEquals(fil.attr, fil.value));


  //   let ce: Expression;
  //   if (filters.length > 0) {
  //     ce = filters.reduce((exp1, exp2) => FilterExpressionUtils.buildComplexExpression(exp1, exp2, FilterExpressionUtils.OP_AND));
  //   }

  //   return ce;

  // }
  // calculateProfit(){
  //   console.log("Profit funciona");
  // }
  filterTable(ev) {
    let siONo = ev;
    console.log(siONo);
  }
  stateUpdate(rowData: any) {

    let atribMap = {
      "state": "denied"
    }
    let keyMap = {
      "id_prequest": rowData.id_prequest
    }
    this.updateRequests(keyMap, atribMap);
    this.tableOut.reloadData();
  }
  destroyConflictedRents(rowData: any) {

    let atribMap = [
      'start_date', 'end_date', 'id_prequest'
    ];
    let deniedAtribMap = [];
    let keyMap = {
      "tproducts_id_product": rowData.tproducts_id_product,
      "state": "pending"
    };
    this.ontimizeService.query(keyMap, atribMap, "myProductRequestEntry").subscribe(
      res => {
        if (res.data && res.data.length) {
          for (let element of res.data) {
            if (element.id_prequest != rowData.id_prequest) {
              if (element.start_date > rowData.start_date && element.start_date < rowData.end_date) {
                deniedAtribMap.push(element);
              } else if (element.end_date >= rowData.start_date && element.end_date <= rowData.end_date) {
                deniedAtribMap.push(element);
              }
            }
          }
        }
      });
    console.log(deniedAtribMap);
  }
  updateRequests(keyMap: any, atribMap: any) {
    this.ontimizeService.update(keyMap, atribMap, "productRequest").subscribe(
      response => {
        if (response) {
          console.log("zi funciona" + response);
        } else {
          console.error("Invalid data format in API response.");
        }
      });
  }
}
