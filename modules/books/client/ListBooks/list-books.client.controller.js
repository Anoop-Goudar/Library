(function () {
  'use strict';

  angular
    .module('books')
    .controller('BooksListController', BooksListController);

  BooksListController.$inject = ['BooksService', 'Authentication', '$location', '$scope'];

  function BooksListController(BooksService, Authentication, $location, $scope) {
    var vm = this;
    vm.selectedItem = 'All';
    vm.categories = [];
    vm.categories.push('All');
    vm.issueBook = issueBook;
    vm.submitBook = submitBook;
    vm.showBookDetails = showBookDetails;
    vm.filteredBooks = vm.books;
    vm.userName = Authentication.user.displayName;
    vm.userEmail = Authentication.user.email;
    vm.requestBook = requestBook;
    vm.requested = false;
    vm.cancelRequest = cancelRequest;

    vm.books = BooksService.query(function() {
      angular.forEach(vm.books, function(book) {
        var index = book.queueList.findIndex(
          function(queueItem) {
            return queueItem.requesterEmail === vm.userEmail;
          }
        );
        if (index >= 0) {
          book.loggedUserRequested = true;
          book.loggedUserQueueNumber = book.queueList[index].queueNumber;
        } else {
          book.loggedUserRequested = false;
        }
        if (vm.categories.indexOf(book.category) === -1) {
          vm.categories.push(book.category);
        }
      });
    });

    function cancelRequest(book) {
      if (window.confirm('Are you sure you want to leave the queue? You may have to stand in the end of the queue once you leave!')) {
        if (book._id) {
          var index = book.queueList.findIndex(
            function(queueItem) {
              return queueItem.requesterEmail === vm.userEmail;
            }
          );
          if (index >= 0) {
            book.loggedUserRequested = false;
            book.loggedUserQueueNumber = 0;
            book.queueList.splice(index, 1);
            for (var i = index; i <= book.queueList.length - 1; i++) {
              book.queueList[i].queueNumber--;
            }
            book.$update(successCallback, errorCallback);
          }
        }
      }
      function successCallback(res) {
        alert('Your request has been cancelled!');
      }
      function errorCallback(res) {
        alert('Unable to cancel your request, please contact admin for more details.');
      }
    }

    function requestBook(book) {
      if (window.confirm('Do you want to stand in the queue among the other readers ?')) {
        if (book._id) {
          var reqObj = {};
          reqObj = {
            requesterName: vm.userName,
            requesterEmail: vm.userEmail,
            queueNumber: book.queueList.length > 0 ? (book.queueList.length + 1) : 1
          };
          book.queueList.push(reqObj);
          book.loggedUserRequested = true;
          book.loggedUserQueueNumber = reqObj.queueNumber;
          book.$update(successCallback, errorCallback);
        }
      }
      function successCallback(res) {
        alert('Your request has been successfully placed!');
      }
      function errorCallback(res) {
        alert('Unable to place your request, please contact admin for more details.');
      }
    }

    function showBookDetails(book) {
      var bookId = book._id;
      $location.url('/books/' + bookId);
    }

    $scope.$watch(function() {return vm.selectedItem;},
              function(newValue, oldValue) {
                if (newValue === 'All') {
                  vm.filteredBooks = vm.books;
                } else {
                  vm.filteredBooks = vm.books.filter(filterBooks);
                }
              }
             );
    function filterBooks(book) {
      return book.category === vm.selectedItem;
    }

    function issueBook(book) {
      if (window.confirm('Do you really read this book ?')) {
        book.status = 'issued';
        book.userName = vm.userName;
        book.userEmail = vm.userEmail;
        BooksService.update({ bookId: book._id }, book);
      }
    }

    function submitBook(book) {
      if (window.confirm('Are you sure you are done reading the book ?')) {
        book.status = 'available';
        book.userName = '';
        book.userEmail = '';
        BooksService.update({ bookId: book._id }, book);
      }
    }
  }
}());
