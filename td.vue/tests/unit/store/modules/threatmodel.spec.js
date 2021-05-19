import { THREATMODEL_CLEAR, THREATMODEL_FETCH, THREATMODEL_FETCH_ALL, THREATMODEL_SELECTED } from '@/store/actions/threatmodel.js';
import threatmodelModule, { clearState } from '@/store/modules/threatmodel.js';
import threatmodelApi from '@/service/threatmodelApi.js';

describe('store/modules/threatmodel.js', () => {
    const getRootState = () => ({
        auth: {
            jwt: 'test'
        },
        repo: {
            selected: 'foobar'
        },
        branch: {
            selected: 'myBranch'
        },
        provider: {
            selected: 'github'
        }
    });
    const mocks = {
        commit: () => {},
        dispatch: () => {},
        rootState: getRootState(),
        state: {
            selected: 'test tm'
        }
    };

    beforeEach(() => {
        jest.spyOn(mocks, 'commit');
        jest.spyOn(mocks, 'dispatch');
        mocks.rootState = getRootState();
    });

    afterEach(() => {
        clearState(threatmodelModule.state);
    });

    describe('state', () => {
        it('defines an all array', () => {
            expect(threatmodelModule.state.all).toBeInstanceOf(Array);
        });

        it('defines a selected string', () => {
            expect(threatmodelModule.state.selected).toEqual('');
        });

        it('defines a data object', () => {
            expect(threatmodelModule.state.data).toBeInstanceOf(Object);
        });
    });

    describe('actions', () => {
        it('commits the clear action', () => {
            threatmodelModule.actions[THREATMODEL_CLEAR](mocks);
            expect(mocks.commit).toHaveBeenCalledWith(THREATMODEL_CLEAR);
        });

        describe('fetch', () => {
            const data = 'foobar';

            beforeEach(() => {
                jest.spyOn(threatmodelApi, 'modelAsync').mockResolvedValue({ data });
            });
            
            describe('local provider', () => {
                beforeEach(async () => {                    
                    mocks.rootState.provider.selected = 'local';
                    await threatmodelModule.actions[THREATMODEL_FETCH](mocks);
                });

                it('does not do a fetch if using a local provider', () => {
                    expect(threatmodelApi.modelAsync).not.toHaveBeenCalled();
                });
            });

            describe('back-end provider', () => {
                beforeEach(async () => {
                    await threatmodelModule.actions[THREATMODEL_FETCH](mocks, 'tm');
                });

                it('dispatches the clear event', () => {
                    expect(mocks.dispatch).toHaveBeenCalledWith(THREATMODEL_CLEAR);
                });
            
                it('commits the fetch action', () => {
                    expect(mocks.commit).toHaveBeenCalledWith(
                        THREATMODEL_FETCH,
                        data
                    );
                });
            });
        });
        
        it('commits the fetch all action', async () => {
            const data = 'foobar';
            jest.spyOn(threatmodelApi, 'modelsAsync').mockResolvedValue({ data });
            await threatmodelModule.actions[THREATMODEL_FETCH_ALL](mocks);
            expect(mocks.commit).toHaveBeenCalledWith(
                THREATMODEL_FETCH_ALL,
                data
            );
        });

        it('does not do a fetch all if using a local provider', async () => {
            jest.spyOn(threatmodelApi, 'modelsAsync');
            mocks.rootState.provider.selected = 'local';
            await threatmodelModule.actions[THREATMODEL_FETCH_ALL](mocks);
            expect(threatmodelApi.modelsAsync).not.toHaveBeenCalled();
        });

        describe('selected', () => {
            const tm = 'test';
            beforeEach(async () => {
                await threatmodelModule.actions[THREATMODEL_SELECTED](mocks, tm);
            });

            it('commits the selected threatmodel', () => {
                expect(mocks.commit).toHaveBeenCalledWith(THREATMODEL_SELECTED, tm);
            });

            it('dispatches the fetch event', () => {
                expect(mocks.dispatch).toHaveBeenCalledWith(THREATMODEL_FETCH, tm);
            });
        });
    });

    describe('mutations', () => {
        describe('clear', () => {
            beforeEach(() => {
                threatmodelModule.state.all.push('test1');
                threatmodelModule.state.all.push('test2');
                threatmodelModule.state.selected = 'test5';
                threatmodelModule.state.data = { foo: 'bar' };
                threatmodelModule.mutations[THREATMODEL_CLEAR](threatmodelModule.state);
            });

            it('empties the all array', () => {
                expect(threatmodelModule.state.all.length).toEqual(0);
            });

            it('resets the selected property', () => {
                expect(threatmodelModule.state.selected).toEqual('');
            });

            it('resets the data property', () => {
                expect(threatmodelModule.state.data).toEqual({});
            });
        });

        describe('fetch', () => {
            const model = { foo: 'bar' };
            beforeEach(() => {
                threatmodelModule.mutations[THREATMODEL_FETCH](threatmodelModule.state, model);
            });

            it('sets the data property', () => {
                expect(threatmodelModule.state.data).toEqual(model);
            });
        });

        describe('fetch all', () => {
            const models = [ 'foo', 'bar' ];

            beforeEach(() => {
                threatmodelModule.mutations[THREATMODEL_FETCH_ALL](threatmodelModule.state, models);
            });

            it('sets the all array to the provided models', () => {
                expect(threatmodelModule.state.all).toEqual(models);
            });
        });

        describe('selected', () => {
            const model = 'test';

            beforeEach(() => {
                threatmodelModule.mutations[THREATMODEL_SELECTED](threatmodelModule.state, model);
            });

            it('sets the model prop', () => {
                expect(threatmodelModule.state.selected).toEqual(model);
            });
        });
    });

    it('defines a getters object', () => {
        expect(threatmodelModule.getters).toBeInstanceOf(Object);
    });
});
