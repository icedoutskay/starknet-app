use snforge_std::EventSpyAssertionsTrait;
// use contracts::Counter::ICounterDispatcherTrait;
use contracts::Counter::{ICounterDispatcher, ICounterDispatcherTrait};
use starknet::ContractAddress;
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, spy_events,
 start_cheat_caller_address, stop_cheat_caller_address, set_balance};
// use contracts::Counter::{ICounterDispatcher};
use contracts::Counter::CounterContract::{CounterChanged, ChangeReason, Event};
use contracts::utils::{strk_address, strk_to_fri};
use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

fn owner_address() -> ContractAddress {
    'owner'.try_into().unwrap()
}

fn user_address() -> ContractAddress {
    'user'.try_into().unwrap()
}

fn deploy_counter(init_counter: u32) -> ICounterDispatcher {
    let owner_address: ContractAddress = owner_address();

   let contract: @snforge_std::ContractClass = declare("CounterContract").unwrap().contract_class();

    let mut constructor_args: Array<felt252> = array![];
    init_counter.serialize(ref constructor_args);
    owner_address.serialize(ref constructor_args);

    let (contract_address, _) = contract.deploy(@constructor_args).unwrap();
     ICounterDispatcher { contract_address };
}

#[test]
fn test_contract_initialization() {
    let dispatcher = deploy_counter(5);
    let current_counter:u32 = dispatcher.get_counter();
    let expected_counter: u32 = 5; 
    assert!(current_counter == expected_counter, "Counter should be initialized to 5");
}

 #[test]
 fn test_increase_counter() {
     let init_counter: u32 = 4;
     let dispatcher: ICounterDispatcher = deploy_counter(init_counter);
     let mut spy: snforge_std::EventSpy = spy_events();

     start_cheat_caller_address(dispatcher.contract_address, user_address());
     dispatcher.increase_counter();
        stop_cheat_caller_address(dispatcher.contract_address);

     let current_counter:u32 = dispatcher.get_counter();

     assert!(current_counter == 5, "Counter should be increased by 1");

     let expected_event = CounterChanged {
         caller: user_address(),
         old_value: 4,
         new_value: 5,
         reason: ChangeReason::Increase,
     };

     spy.assert_emitted(@array![(
     dispatcher.contract_address,
     Event::CounterChanged(expected_event)
     )]);
 }

 #[test]
 fn test_decrease_counter_happy_path() {
     let init_counter: u32 = 4;
     let dispatcher: ICounterDispatcher = deploy_counter(init_counter);
       let mut spy: snforge_std::EventSpy = spy_events();
     
          start_cheat_caller_address(dispatcher.contract_address, user_address());
     dispatcher.decrease_counter();
        stop_cheat_caller_address(dispatcher.contract_address);

     let current_counter:u32 = dispatcher.get_counter();

     assert!(current_counter == 3, "Counter should be decreased by 1");

      let expected_event = CounterChanged {
         caller: user_address(),
         old_value: 4,
         new_value: 3,
         reason: ChangeReason::Decrease,
     };

     spy.assert_emitted(@array![(
     dispatcher.contract_address,
     Event::CounterChanged(expected_event)
     )]);
 }

  #[test]
  #[should_panic]
 fn test_decrease_counter_fail_path() {
     let init_counter: u32 = 0;
     let dispatcher: ICounterDispatcher = deploy_counter(init_counter);

     dispatcher.decrease_counter();
      dispatcher.get_counter();

 }

    #[test]
    fn test_set_counter_owner() {
        let init_counter: u32 = 4;
        let dispatcher: ICounterDispatcher = deploy_counter(init_counter);
          let mut spy: snforge_std::EventSpy = spy_events();
           
           let new_counter: u32 = 10;
            start_cheat_caller_address(dispatcher.contract_address, owner_address());
        dispatcher.set_counter(new_counter);
           stop_cheat_caller_address(dispatcher.contract_address);

        let current_counter:u32 = dispatcher.get_counter();

        assert!(current_counter == new_counter, "the owner is unable to set the counter");

         let expected_event: CounterChanged = CounterChanged {
            caller: owner_address(),
            old_value: 4,
            new_value: 10,
            reason: ChangeReason::Set,
        };

        spy.assert_emitted(@array![(
        dispatcher.contract_address,
        Event::CounterChanged(expected_event)
        )]);
    }

        #[test]
        #[should_panic]
        fn set_counter_non_owner() {
            let init_counter: u32 = 4;
            let dispatcher: ICounterDispatcher = deploy_counter(init_counter);
              
              let new_counter: u32 = 10;
              start_cheat_caller_address(dispatcher.contract_address, user_address());
                dispatcher.set_counter(new_counter);
              
        }

       #[test]
       #[should_panic]
       fn test_reset_counter_insufficient_balance() {
           let init_counter: u32 = 4;
           let dispatcher: ICounterDispatcher = deploy_counter(init_counter);
              
               start_cheat_caller_address(dispatcher.contract_address, user_address());
           dispatcher.reset_counter();
   }
          #[test]
            #[should_panic ]
              fn test_reset_counter_insufficient_allowance() {
                  let init_counter: u32 = 4;
                  let dispatcher: ICounterDispatcher = deploy_counter(init_counter);

                  let caller: ContractAddress = user_address();

                     set_balance(caller, strk_to_fri(10), Token::STRK);

                      start_cheat_caller_address(dispatcher.contract_address, caller);
                  dispatcher.reset_counter();
            }


     #[test]
     fn test_reset_counter_success() {
         let init_counter: u32 = 4;
         let counter: ICounterDispatcher = deploy_counter(init_counter);
         let mut spy: snforge_std::EventSpy = spy_events();

            let user: ContractAddress = user_address();

              set_balance{caller, strk_to_fri(10), Token::STRK};
              let erc20: IERC20Dispatcher = IERC20Dispatcher { contract_address: strk_address() };

              start_cheat_caller_address(erc_20.contract_address, user);
              erc_20.approve(counter.contract_address, strk_to_fri(5) );
              start_cheat_caller_address(erc_20.contract_address);

                start_cheat_caller_address(counter.contract_address, caller);
            counter.reset_counter();
                stop_cheat_caller_address(counter.contract_address);

                assert!(counter.get_counter() == 0, "unable to reset counter even with sufficient balance and allowance");
             
             let expected_event: CounterChanged = CounterChanged {
                 caller: user,
                 old_value: 4,
                 new_value: 0,
                 reason: ChangeReason::Reset,
             };

                spy.assert_emitted(@array![(
                counter.contract_address,
                Event::CounterChanged(expected_event)
                )]);

                assert!(erc_20.balance_of(user) == strk_to_fri(9) , "Balance mismatch") ;
                assert!(erc_20.balance_of(owner_address()) == strk_to_fri(1) , "Owner Balance mismatch");
       }