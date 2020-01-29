///////// BUDGET CONTROLLER ///////////
let budgetController = (function(){
    let Expense = function(id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    }
    Expense.prototype.getPercentage = function() {
        return this.percentage
    }




    let Income = function(id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    let calculateTotal = function(type) {
        let sum = 0
        data.allItems[type].forEach(function(cur){
            sum += cur.value
        })
        data.totals[type] = sum
    }

    var allExpenses = []
    var allIncomes = []
    var totalExpenses = 0

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    return {
        addItem: function(type, des, val) {
            var newItem, ID
           // ID next ID = last ID + 1
            // CREATE NEW ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }
            

            // CREATE NEW ITEM BASED ON 'INC' OR 'EXP' TYPE
            if(type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val)
            }
            // PUSH IT TO OUR DATA STRUCTURE
            data.allItems[type].push(newItem)

            return newItem
            
        },

        deleteItem: function(type, id) {
            let ids, index
            // data.allItems[type][id]
            ids = data.allItems[type].map(function(current){
                return current.id
            })
            index = ids.indexOf(id)
            if(index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function() {
            // CALC TOTAL INCOME AND EXPENSES
            calculateTotal('exp')
            calculateTotal('inc')

            // CALC THE BUDGET: INCOME - EXPENSES
            data.budget = data.totals.inc - data.totals.exp
            // CALC PERCENTAGE OF INCOME THAT WE SPENT
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1
            }
            // EXPENSE = 100 AND INCOME 300, SPENT 33.333% = 100/300 = 0.3333 * 100
        
        },
        calculatePercentage: function() {
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100 = 20%
            b=10/100 = 10%
            c=40/100 = 40%
            */
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc)
            })


        },
        getPercentages: function() {
            let allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage()
            })
            return allPercentages

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data)
        }
    }
        
}) ()

//////// UI CONTROLLER //////////
var UIController = (function(){
    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container-fluid',
        expnesesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    let formatNumber = function(num, type) {
        let numSplit, int, dec
        // + OR - BEFORE NUMBER 

        // EXACTLY 2 DECIMAL POINTS 

        // COMMA SEPERATING THE THOUSANDS 

        // 2300.4567 -> + 2,310.46

        num = Math.abs(num)
        num = num.toFixed(2)

        numSplit = num.split('.')
        int = numSplit[0]
        
        if(int.length > 3) {
            int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3 , 3) // INPUT 2310 -> 2,310
        }
        dec = numSplit[1]
        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec

    }

    let nodelistForEach = function(list, callback) {
        for(let i =0; i < list.length; i++) {
            callback(list[i], i)
        }
    }

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // GETS EITHER INC OR EXP

            description: document.querySelector(DOMstrings.inputDescription).value, // GETS DESCRIPTION FROM DESCRIPTION BOX 

            value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // GETS THE DOLLAR AMOUNT 
            }
            
        },
        addListItem: function(obj, type) {
            let html, newHtml, element
            

            // CREATE HTML STRING WITH PLACEHOLDER TEXT
            if(type === 'inc'){
                element = DOMstrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if(type === 'exp') {
                element = DOMstrings.expensesContainer
                html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
           

            
            // REPLACE THE PLACEHOLDER TEXT WITH ACTUAL DATA
           newHtml = html.replace('%id%', obj.id)
           newHtml = newHtml.replace('%description%', obj.description)
           newHtml = newHtml.replace('%value%', formatNumber( obj.value, type))

            // INSERT HTML INTO THE DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },

        deleteListItem: function(selectorID) {
            let el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },



        clearFields: function() {
            let fields, fieldsArray
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)
            
            fieldsArray = Array.prototype.slice.call(fields)

            fieldsArray.forEach(function(current, index, array) {
                current.value = ""
            })
            fieldsArray[0].focus()
        },

        displayBudget: function(obj) {
            var type
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')
            

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%"
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage = '---'
            }
        },

        displayPercentages: function(percentages) {
          let fields = document.querySelectorAll(DOMstrings.expnesesPercLabel)

          
          nodelistForEach(fields, function(current, index) {
              if(percentages[index] > 0) {
                  current.textContent = percentages[index] + '%'
                } else {
                    current.textContent = '---'
                }

          })
        },
        displayMonth: function() {
            let now, year, month, months
             now = new Date()
             months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
             month = now.getMonth()
             year = now.getFullYear()
             document.querySelector(DOMstrings.dateLabel).textContent = months[month] +  " " + year
        },

       changedType: function(){
        let fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue)

        nodelistForEach(fields, function(cur) {
            cur.classList.toggle('red-focus')
        })
        document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
       },

        


        getDomstrings: function() {
            return DOMstrings
        }
    }

}) ()

// Global APP CONTROLLER 
let controller = (function(budgetCtrl, UICtrl){
    let DOM = UICtrl.getDomstrings()

    let setUpEventListeners = function() {
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)
    
    document.addEventListener('keypress', function(event){
        if(event.keyCode === 13 || event.which === 13) {
            ctrlAddItem()
        }
    })
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
}

let updateBudget= function() {
    // CALCULATE THE BUDGET 
    budgetCtrl.calculateBudget()

    // RETURN BUDGET
    let budget = budgetCtrl.getBudget()

    // DISPLAY THE BUDGET ON UI
    UICtrl.displayBudget(budget)
}

let updatePercentages = function() {
    // CALC PERCENTAGES
    budgetCtrl.calculatePercentage()
    // READ PERCENTAGES FROM THE BUDGET CONTROLLER
    let percentages = budgetCtrl.getPercentages()
    // UPDATE UI
    UICtrl.displayPercentages(percentages)
}

    let ctrlAddItem = function() {
        var input, newItem
        // 1. GET INPUT DATA
         input = UICtrl.getInput()

         if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. ADD THE ITEM TO THE BUDGET CONTROLLER 
         newItem = budgetCtrl.addItem(input.type, input.description, input.value)
         // 3. ADD ITEM TO THE UI
         UICtrl.addListItem(newItem, input.type)
 
         // CLEAR FIELDS
         UICtrl.clearFields()
 
         // CALCULATE AND UPDATE BUDGET
         updateBudget()

         //CALC AND UPDATE PERCENTAGES
         updatePercentages()
         }
    }

    let ctrlDeleteItem = function(event) {
        let itemId, splitId, type, ID
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id

        if(itemId) {
            // inc-1
            splitId = itemId.split('-')
            type = splitId[0]
            ID = parseInt(splitId[1])

            // DELETE ITEM FROM DATA STRUCTURE
            budgetCtrl.deleteItem(type, ID)

            // DELETE ITEM FROM UI
            UICtrl.deleteListItem(itemId)

            // UPDATE AND SHOW THE NEW BUDGET
            updateBudget()
        }
    }
        
        
    

    return {
        init: function() {
            console.log('app has started')
            UICtrl.displayMonth()
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setUpEventListeners()
        }
    }



    }) (budgetController, UIController)

    controller.init()


    


