import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';

import {concatMap, tap, withLatestFrom} from 'rxjs/operators';
import {EMPTY, of} from 'rxjs';
import {loadTreesSuccess, selectTreeData, TreeDataFacadeService} from '@natr/the-trees';
import {Action, Store} from '@ngrx/store';
import {CallbackSearchActionPropType, doCallbackSearch, doSearch, SearchActionPropType} from '../+state/search/actions/search.actions';
import {TreeModel} from '@natr/the-trees/lib/models/tree.model';
import {GenealogistService} from '../genealogist.service';
import {HistorianService, Logging} from '@natr/historian';

@Logging
@Injectable()
export class GenealogistEffects {
  private logger: HistorianService;

  private withState = concatMap(
    (action: Action) => of(action)
      .pipe(
        withLatestFrom(this.store.select(selectTreeData))
      )
  );

  loadSearch$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(doSearch),
        this.withState,
        tap(
          ([action, treeData]: [SearchActionPropType & Action, TreeModel]) => {
            this.logger.debug(`loadSearch action`, action);
            this.logger.debug(`loadSearch treeData`, treeData);
            const filteredData = this.genealogistService.search(action.searchObject, treeData);
            if (filteredData) {
              this.treeDataFacade.dispatchLocalLoadTree(filteredData);
            }
          }
        )
      );
    },
    {dispatch: false}
  );

  loadCallbackSearch$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(doCallbackSearch),
        this.withState,
        tap(
          ([action, treeData]: [CallbackSearchActionPropType & Action, TreeModel]) => {
            this.logger.debug(`loadCallbackSearch action`, action);
            this.logger.debug(`loadCallbackSearch treeData`, treeData);
            const filteredData = action.callback(action.searchObject, treeData);
            this.treeDataFacade.dispatchLocalLoadTree(filteredData);
          }
        )
      );
    },
    {dispatch: false}
  );

  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private genealogistService: GenealogistService,
    private treeDataFacade: TreeDataFacadeService
  ) {
  }

}
